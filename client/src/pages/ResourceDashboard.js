import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Droplets,
    Zap,
    Trash2,
    Bus,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    ArrowLeft,
    BarChart3,
    MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import Loader from '../components/UI/Loader';
import toast from 'react-hot-toast';

const ResourceDashboard = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const resourceType = type.charAt(0).toUpperCase() + type.slice(1);

    const [usageData, setUsageData] = useState([]);
    const [issues, setIssues] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [type]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usageRes, analyticsRes, issuesRes] = await Promise.all([
                api.get(`/usage?resourceType=${resourceType}`),
                api.get('/usage/analytics'),
                api.get(`/issues?resourceType=${resourceType}`)
            ]);
            setUsageData(usageRes.data);
            setAnalytics(analyticsRes.data);
            setIssues(issuesRes.data.filter(i => i.status !== 'Resolved'));
        } catch (err) {
            toast.error(`Fault detected in ${resourceType} telemetry.`);
            console.error('Failed to fetch resource data');
        } finally {
            setLoading(false);
        }
    };

    const getResourceIcon = () => {
        switch (resourceType) {
            case 'Water': return <Droplets size={32} className="text-water" />;
            case 'Electricity': return <Zap size={32} className="text-electricity" />;
            case 'Waste': return <Trash2 size={32} className="text-waste" />;
            case 'Transport': return <Bus size={32} className="text-transport" />;
            default: return <BarChart3 size={32} className="text-emerald-accent" />;
        }
    };

    const getResourceColor = () => {
        switch (resourceType) {
            case 'Water': return '#3b82f6';
            case 'Electricity': return '#fbbf24';
            case 'Waste': return '#10b981';
            case 'Transport': return '#f43f5e';
            default: return '#10b981';
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-text-muted">
            <Loader size="lg" />
            <div className="animate-pulse font-black uppercase tracking-[0.3em] text-[10px]">
                Initializing {resourceType} Terminal...
            </div>
        </div>
    );

    const score = analytics?.resourceScores?.[resourceType] || 0;
    const chartData = usageData.slice(0, 7).reverse().map(log => ({
        date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        units: log.metrics?.units || log.metrics?.meterReading || log.metrics?.unitsConsumed || 0
    }));

    return (
        <div className="fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all active:scale-95 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="flex-1 flex items-center gap-5">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-lg">
                        {getResourceIcon()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight uppercase mb-0">{resourceType} Terminal</h1>
                        <p className="text-text-muted font-bold text-xs-caps mt-1">ID: X-{resourceType.toUpperCase()}-09 • ONLINE</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-xs-caps text-text-muted">Efficiency Rating</span>
                    <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                        <TrendingUp size={16} className="text-emerald-400" />
                        <span className="text-xl font-black text-emerald-400 leading-none">{score}%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
                <div className="lg:col-span-8 glass-card bg-slate-900/40 p-8 border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xs-caps text-white">Consumption Wavefront</h3>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">7-Day Real-time Telemetry</p>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500/50 animate-pulse" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white/10 border border-white/20" />
                        </div>
                    </div>

                    <div className="h-[320px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={getResourceColor()} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={getResourceColor()} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="rgba(255,255,255,0.2)"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.2)"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        backdropFilter: 'blur(12px)',
                                        padding: '16px'
                                    }}
                                    itemStyle={{ color: 'white', fontWeight: 'bold' }}
                                    labelStyle={{ color: 'rgba(255,255,255,0.4)', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'black' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="units"
                                    stroke={getResourceColor()}
                                    fillOpacity={1}
                                    fill="url(#colorWave)"
                                    strokeWidth={4}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-4 glass-card bg-slate-900/40 p-8 border-white/5 shadow-2xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs-caps text-white mb-6">Operational Status</h3>

                        <div className="space-y-5">
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Grid Stability</span>
                                <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    Nominal
                                </div>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Monthly Load</span>
                                <span className="text-white font-black text-xs uppercase tracking-widest">+1.2k Units</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">System Alerts</span>
                                <div className={`font-black text-xs uppercase tracking-widest ${issues.length > 0 ? 'text-amber-400' : 'text-text-muted/40'}`}>
                                    {issues.length} Pending
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flex justify-between items-end mb-2.5">
                            <span className="text-xs-caps text-text-muted">Health Index</span>
                            <span className="text-base font-black text-white">{score}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                            />
                        </div>
                        <p className="mt-5 text-[9px] text-center font-bold text-text-muted/60 leading-relaxed italic uppercase tracking-widest">
                            {score >= 70 ? 'Sector operating at peak efficiency' : 'Optimization required in this sub-grid'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 mb-10">
                <h2 className="text-lg font-black text-white tracking-widest uppercase flex items-center gap-2.5">
                    <AlertCircle size={18} className="text-amber-500" /> Active System Faults
                </h2>
                {issues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {issues.map((issue, idx) => (
                            <motion.div
                                key={issue._id}
                                whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                className="glass-card p-5 flex flex-col gap-3 border-l-4 border-l-amber-500 shadow-xl transition-all"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="px-2.5 py-0.5 bg-amber-500/10 rounded-md text-[8px] font-black text-amber-500 uppercase tracking-widest border border-amber-500/20">
                                        {issue.status}
                                    </div>
                                    <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest opacity-40">#{issue._id.slice(-6)}</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-base tracking-tight mb-1 uppercase">{issue.issueType}</h4>
                                    <p className="text-[9px] text-text-muted font-bold flex items-center gap-1.5 uppercase tracking-widest">
                                        <MapPin size={9} /> {issue.location}
                                    </p>
                                </div>
                                <p className="text-xs text-text-muted/70 leading-relaxed font-medium line-clamp-2 italic border-t border-white/5 pt-3 mt-1">"{issue.description}"</p>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-10 text-center border-dashed border-2 border-white/5 bg-white/[0.01]">
                        <p className="text-text-muted font-bold text-xs italic uppercase tracking-widest opacity-50">Zero active faults identified. All system sub-modules reporting nominal.</p>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <h2 className="text-lg font-black text-white tracking-widest uppercase">Consumption Artifacts</h2>
                <div className="glass-card overflow-hidden border-white/5 shadow-2xl bg-slate-900/40">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.03] border-b border-white/5">
                                <th className="px-6 py-4 text-xs-caps text-text-muted">Timestamp</th>
                                <th className="px-6 py-4 text-xs-caps text-text-muted">Units Consumed</th>
                                <th className="px-6 py-4 text-xs-caps text-text-muted">Fiscal Impact</th>
                                <th className="px-6 py-4 text-xs-caps text-text-muted text-right">Logged By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {usageData.length > 0 ? (
                                usageData.slice(0, 10).map((log) => (
                                    <tr key={log._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4 text-xs font-bold text-white/40 group-hover:text-white/70 transition-colors uppercase">{new Date(log.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-black text-white text-base tracking-tight">
                                            {log.metrics?.units || log.metrics?.meterReading || log.metrics?.unitsConsumed || 0}
                                        </td>
                                        <td className="px-6 py-4 text-emerald-400 font-bold text-xs tracking-widest">${log.totalCost}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="px-3 py-1 bg-white/5 rounded-md text-[9px] font-black text-text-muted group-hover:text-white group-hover:bg-emerald-500/20 transition-all uppercase tracking-widest">
                                                {log.loggedBy?.name || 'System Auto-Log'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-text-muted font-bold text-xs italic uppercase tracking-widest opacity-40">No consumption artifacts provisioned in this sector.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


export default ResourceDashboard;

