import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const registerGymOwner = async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber, gymName, gymAddress } = req.body;

    // Check if email already exists
    const existingOwner = await prisma.gymOwner.findUnique({
      where: { email }
    });

    if (existingOwner) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create gym owner
    const gymOwner = await prisma.gymOwner.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phoneNumber,
        gymName,
        gymAddress
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        gymName: true,
        phoneNumber: true,
        gymAddress: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { gymOwnerId: gymOwner.id, email: gymOwner.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Gym owner registered successfully',
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

    // Find gym owner
    const gymOwner = await prisma.gymOwner.findUnique({
      where: { email }
    });

    if (!gymOwner) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, gymOwner.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { gymOwnerId: gymOwner.id, email: gymOwner.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      gymOwner: {
        id: gymOwner.id,
        email: gymOwner.email,
        fullName: gymOwner.fullName,
        gymName: gymOwner.gymName,
        phoneNumber: gymOwner.phoneNumber,
        gymAddress: gymOwner.gymAddress
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const gymOwner = await prisma.gymOwner.findUnique({
      where: { id: req.gymOwnerId },
      select: {
        id: true,
        email: true,
        fullName: true,
        gymName: true,
        phoneNumber: true,
        gymAddress: true,
        createdAt: true
      }
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
