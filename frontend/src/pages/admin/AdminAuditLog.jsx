import { useState, useEffect } from 'react';
import { ScrollText, CheckCircle2, XCircle, PauseCircle, PlayCircle, CalendarPlus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const actionMeta = {
  'license.approve': { label: 'Approved gym', icon: CheckCircle2, className: 'text-emerald-400 bg-emerald-500/15' },
  'license.reject': { label: 'Rejected gym', icon: XCircle, className: 'text-rose-400 bg-rose-500/15' },
  'license.suspend': { label: 'Suspended licence', icon: PauseCircle, className: 'text-amber-400 bg-amber-500/15' },
  'license.activate': { label: 'Activated licence', icon: PlayCircle, className: 'text-sky-400 bg-sky-500/15' },
  'license.extend': { label: 'Extended licence', icon: CalendarPlus, className: 'text-primary-400 bg-primary-500/15' }
};

const AdminAuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/super-admin/audit-log')
      .then((res) => setLogs(res.data.logs))
      .catch(() => toast.error('Failed to load audit log'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Audit Log</h1>
        <p className="page-subtitle">Every action taken on gym accounts and licences, most recent first</p>
      </div>

      {logs.length > 0 ? (
        <div className="card !p-0 overflow-hidden">
          <div className="divide-y divide-white/5">
            {logs.map((log) => {
              const meta = actionMeta[log.action] || { label: log.action, icon: ScrollText, className: 'text-ink-400 bg-white/5' };
              const Icon = meta.icon;
              return (
                <div key={log.id} className="flex items-start gap-4 p-5 hover:bg-white/5 transition-colors">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${meta.className}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                      <p className="font-medium text-white">
                        {meta.label}
                        {log.targetGymName && <span className="text-ink-400 font-normal"> — {log.targetGymName}</span>}
                      </p>
                      <p className="text-xs text-ink-500 shrink-0">
                        {format(new Date(log.createdAt), 'MMM dd, yyyy · hh:mm a')}
                      </p>
                    </div>
                    <p className="text-sm text-ink-400 mt-0.5">
                      by {log.actorEmail}
                      {log.details && <span> · {log.details}</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <ScrollText className="text-ink-500" size={26} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No Activity Yet</h3>
          <p className="text-ink-400">Admin actions on gym accounts will show up here.</p>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLog;
