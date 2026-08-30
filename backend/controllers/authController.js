import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const TRIAL_DAYS = 14;

const ownerSelect = {
  id: true,
  email: true,
  fullName: true,
  gymName: true,
  phoneNumber: true,
  gymAddress: true,
  createdAt: true,
  isSuperAdmin: true,
  licenseStatus: true,
  licensePlan: true,
  licenseAmount: true,
  licenseExpiresAt: true
};

const signToken = (gymOwner) =>
  jwt.sign(
    { gymOwnerId: gymOwner.id, email: gymOwner.email, isSuperAdmin: gymOwner.isSuperAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

export const registerGymOwner = async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber, gymName, gymAddress } = req.body;

    const existingOwner = await prisma.gymOwner.findUnique({ where: { email } });
    if (existingOwner) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const gymOwner = await prisma.gymOwner.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phoneNumber,
        gymName,
        gymAddress,
        licenseStatus: 'pending'
      },
      select: ownerSelect
    });

    const token = signToken(gymOwner);

    res.status(201).json({
      message: 'Registration submitted — awaiting admin approval',
      token,
      gymOwner
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register gym owner' });
  }
};

export const loginGymOwner = async (req, res) => {
  try {
    const { email, password } = req.body;

    const gymOwner = await prisma.gymOwner.findUnique({ where: { email } });

    if (!gymOwner) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, gymOwner.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(gymOwner);
    const { password: _pw, ...safeOwner } = gymOwner;

    res.json({
      message: 'Login successful',
      token,
      gymOwner: safeOwner
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const gymOwner = await prisma.gymOwner.findUnique({ where: { email } });

    // Always respond the same way whether or not the account exists —
    // don't leak which emails are registered
    if (gymOwner) {
      const resetToken = jwt.sign(
        { gymOwnerId: gymOwner.id, purpose: 'password-reset' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const frontendUrl = process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      // No email service configured — print to the server console instead.
      // In production this block would call an email provider (Resend, SendGrid, etc).
      console.log('\n📧 Password reset requested for:', email);
      console.log('🔗 Reset link (valid 15 min):', resetLink, '\n');
    }

    res.json({ message: 'If that email is registered, a reset link has been generated.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'This reset link is invalid or has expired' });
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.gymOwner.update({
      where: { id: decoded.gymOwnerId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const gymOwner = await prisma.gymOwner.findUnique({
      where: { id: req.gymOwnerId },
      select: ownerSelect
    });

    if (!gymOwner) {
      return res.status(404).json({ error: 'Gym owner not found' });
    }

    res.json({ gymOwner });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
