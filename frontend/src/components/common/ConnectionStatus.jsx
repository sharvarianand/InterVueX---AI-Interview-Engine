import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Server, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { healthCheck } from '../services/api';

/**
 * Connection status indicator for backend connectivity
 */
export default function ConnectionStatus({ showFull = false }) {
    const [status, setStatus] = useState('checking'); // checking, connected, disconnected
    const [lastChecked, setLastChecked] = useState(null);

    useEffect(() => {
        checkConnection();

        // Check every 30 seconds
        const interval = setInterval(checkConnection, 30000);
        return () => clearInterval(interval);
    }, []);

    const checkConnection = async () => {
        try {
            const result = await healthCheck();
            if (result.status === 'ok') {
                setStatus('connected');
            } else {
                setStatus('disconnected');
            }
        } catch (error) {
            setStatus('disconnected');
        }
        setLastChecked(new Date());
    };

    const statusConfig = {
        checking: {
            icon: Loader2,
            color: 'text-amber-400',
            bg: 'bg-amber-500/20',
            border: 'border-amber-500/30',
            label: 'Checking...',
            animate: true,
        },
        connected: {
            icon: CheckCircle,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/20',
            border: 'border-emerald-500/30',
            label: 'Connected',
            animate: false,
        },
        disconnected: {
            icon: XCircle,
            color: 'text-red-400',
            bg: 'bg-red-500/20',
            border: 'border-red-500/30',
            label: 'Disconnected',
            animate: false,
        },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    if (showFull) {
        return (
            <div className={`p-3 rounded-xl ${config.bg} border ${config.border} flex items-center gap-3`}>
                <div className={`${config.color}`}>
                    <Icon className={`w-5 h-5 ${config.animate ? 'animate-spin' : ''}`} />
                </div>
                <div className="flex-1">
                    <div className={`text-sm font-medium ${config.color}`}>
                        {config.label}
                    </div>
                    <div className="text-xs text-white/50">
                        Backend API {status === 'connected' ? 'is running' : 'unreachable'}
                    </div>
                </div>
                <button
                    onClick={checkConnection}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    title="Refresh"
                >
                    <Server className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${config.color} text-xs font-medium`}
        >
            <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-400' :
                    status === 'disconnected' ? 'bg-red-400' : 'bg-amber-400'
                } ${status === 'connected' ? 'animate-pulse' : ''}`} />
            {config.label}
        </motion.div>
    );
}
