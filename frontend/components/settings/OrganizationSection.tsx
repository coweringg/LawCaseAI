import React, { useState } from 'react';
import { Building, Eye, EyeOff, Copy, RotateCcw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface OrganizationSectionProps {
    orgData: any;
    isLoadingOrg: boolean;
    members: any[];
    isLoadingMembers: boolean;
    onRefreshMembers: () => void;
    onRemoveMember: (id: string) => void;
    onIncreaseCapacity: () => void;
    currentUserId: string;
}

export const OrganizationSection: React.FC<OrganizationSectionProps> = ({
    orgData,
    isLoadingOrg,
    members,
    isLoadingMembers,
    onRefreshMembers,
    onRemoveMember,
    onIncreaseCapacity,
    currentUserId
}) => {
    const [showFirmCode, setShowFirmCode] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
        >
            <div className="glass-dark border border-white/10 rounded-[32px] overflow-hidden relative">
                <div className="absolute inset-0 crystallography-pattern opacity-[0.02] pointer-events-none"></div>
                <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                    <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-widest">
                        <Building className="text-primary" size={20} />
                        Firm Management
                    </h2>
                </div>

                <div className="p-6 space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Firm Access Protocol</h3>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
                                    <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl p-2 pr-4 transition-all overflow-hidden">
                                        <input
                                            type={showFirmCode ? "text" : "password"}
                                            readOnly
                                            value={orgData?.firmCode || '••••••••••••'}
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-white font-mono font-black tracking-widest px-4 py-3 text-lg"
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setShowFirmCode(!showFirmCode)}
                                                className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                                title={showFirmCode ? "Hide Code" : "Show Code"}
                                            >
                                                {showFirmCode ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (orgData?.firmCode) {
                                                        navigator.clipboard.writeText(orgData.firmCode);
                                                        toast.success('Firm Code copied to vault');
                                                    }
                                                }}
                                                className="p-3 bg-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl transition-all"
                                                title="Copy Code"
                                            >
                                                <Copy size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[9px] text-slate-500 font-bold mt-2 uppercase tracking-wider leading-relaxed">
                                    Share this code with your firm members for instant Enterprise access.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Neural Seat Allocation</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Seats</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                                {orgData?.usedSeats || 0} / {orgData?.totalSeats || 0} Members
                                            </span>
                                            <button
                                                onClick={onIncreaseCapacity}
                                                className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                                            >
                                                Increase
                                            </button>
                                        </div>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5 p-0.5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((orgData?.usedSeats || 0) / (orgData?.totalSeats || 1)) * 100}%` }}
                                            className="bg-primary h-full rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)]"
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                        <span>Allocated: {orgData?.usedSeats}</span>
                                        <span>Available: {(orgData?.totalSeats || 0) - (orgData?.usedSeats || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex gap-4">
                        <div className="flex-1 p-6 bg-white/[0.02] rounded-[2rem] border border-white/5">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Firm Integrity</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                                All members registered with this code automatically inherit Enterprise level benefits and firm-wide SOC2 Type II compliance.
                            </p>
                        </div>
                        <div className="flex-1 p-6 bg-white/[0.02] rounded-[2rem] border border-white/5">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Centralized Billing</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                                Billing is managed centrally for your convenience. Individual licenses do not require personal payment methods.
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Member Directory</h3>
                            <button
                                onClick={onRefreshMembers}
                                disabled={isLoadingMembers}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 active:scale-95 text-[10px] font-black uppercase tracking-[0.2em] text-white rounded-xl transition-all border border-white/5 group disabled:opacity-50"
                            >
                                <RotateCcw size={14} className={`${isLoadingMembers ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                                {isLoadingMembers ? 'Syncing...' : 'Refresh Nodes'}
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="pb-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">Operator</th>
                                        <th className="pb-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">Access Key</th>
                                        <th className="pb-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">Role</th>
                                        <th className="pb-2 text-[9px] font-black text-slate-600 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {(isLoadingMembers || isLoadingOrg) ? (
                                        <tr><td colSpan={4} className="py-8 text-center text-[10px] font-bold text-slate-500 uppercase">Scanning for signatures...</td></tr>
                                    ) : members.length === 0 ? (
                                        <tr><td colSpan={4} className="py-8 text-center text-[10px] font-bold text-slate-500 uppercase">No active operators detected</td></tr>
                                    ) : members.map((member) => (
                                        <tr key={member._id} className="group">
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black text-slate-400">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <span className="text-xs font-black text-white uppercase truncate max-w-[150px]">{member.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-[10px] font-bold text-slate-500 truncate">{member.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${member.role === 'org_admin' ? 'bg-primary/20 text-primary border-primary/20' : 'bg-slate-500/10 text-slate-400 border-white/5'}`}>
                                                    {member.role === 'org_admin' ? 'Admin' : 'Member'}
                                                </span>
                                            </td>
                                            <td className="py-3 pl-4 text-right">
                                                {member._id !== currentUserId && (
                                                    <button
                                                        onClick={() => onRemoveMember(member._id)}
                                                        className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                                    >
                                                        <span className="material-icons-round text-lg">person_remove</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
