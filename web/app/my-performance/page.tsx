'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Target, MessageSquare, CheckCircle, Save, X, Info } from 'lucide-react';
import StaggeredMenu from '../../components/navBar';
import Waves from '../../components/Background/Waves';
import { useAuth } from '../../context/AuthContext';
import { getMenuItems } from '../../utils/menu';

interface KRAAssignment {
    assignment_id: number;
    kra_id: number;
    name: string;
    goal_name: string;
    description: string;
    criteria?: string; // JSON string
    period: string;
    status: string;
    self_rating: number | null;
    manager_rating: number | null;
    final_score: number | null;
    self_comment: string | null;
    manager_comment: string | null;
    assigned_at: string;
}

interface Criteria {
    [score: string]: string;
}

export default function MyPerformance() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [assignments, setAssignments] = useState<KRAAssignment[]>([]);
    const [loading, setLoading] = useState(true);

    // Rating Modal State
    const [selectedAssignment, setSelectedAssignment] = useState<KRAAssignment | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const menuItems = getMenuItems(user?.role);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
            return;
        }
        if (user) fetchMyKRAs();
    }, [user, authLoading, router]);

    const fetchMyKRAs = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/performance/my-kras', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setAssignments(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenRate = (assignment: KRAAssignment) => {
        setSelectedAssignment(assignment);
        setRating(assignment.self_rating || 0);
        setComment(assignment.self_comment || '');
    };

    const submitRating = async () => {
        if (!selectedAssignment) return;
        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:8000/api/performance/self-rating', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignment_id: selectedAssignment.assignment_id,
                    self_rating: rating,
                    self_comment: comment
                }),
                credentials: 'include'
            });

            if (res.ok) {
                setAssignments(prev => prev.map(a =>
                    a.assignment_id === selectedAssignment.assignment_id
                        ? { ...a, self_rating: rating, self_comment: comment, status: 'Self-Rated' }
                        : a
                ));
                setSelectedAssignment(null);
            } else {
                alert('Failed to submit rating');
            }
        } catch (err) {
            console.error(err);
            alert('Error submitting rating');
        } finally {
            setSubmitting(false);
        }
    };

    // Grouping Logic
    const groupedAssignments = assignments.reduce((acc, curr) => {
        const category = curr.goal_name || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(curr);
        return acc;
    }, {} as Record<string, KRAAssignment[]>);

    if (loading) return <div className="min-h-screen bg-brand-black flex items-center justify-center text-white">Loading Performance Data...</div>;

    return (
        <div className="min-h-screen bg-brand-black text-white relative">
            <Waves lineColor="#230a46ff" backgroundColor="rgba(0,0,0,0.2)" className="fixed inset-0 pointer-events-none z-0" />

            <StaggeredMenu
                position="right"
                isFixed={true}
                items={menuItems}
                displayItemNumbering={true}
                smartHeader={true}
                logoUrl="/logo.png"
                menuBackgroundColor="#000000ff"
            />

            <main className="mx-auto max-w-7xl p-6 pt-32 relative z-10 animate-fade-in-up">

                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                                <Target size={32} />
                            </div>
                            Performance Appraisal Form
                        </h1>
                        <p className="text-gray-400">Self-Assessment Period: Q1</p>
                    </div>
                </header>

                <div className="space-y-8">
                    {Object.entries(groupedAssignments).map(([category, items]) => (
                        <div key={category} className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl overflow-hidden shadow-xl">
                            <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#222] flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white uppercase tracking-wide">{category}</h2>
                                <span className="text-xs font-bold bg-[#333] px-2 py-1 rounded text-gray-400">{items.length} Parameters</span>
                            </div>

                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#222] text-gray-500 text-xs uppercase">
                                        <th className="p-4 w-1/4 font-semibold">Subcategory / Parameter</th>
                                        <th className="p-4 w-1/6 font-semibold text-center">Scale / Criteria</th>
                                        <th className="p-4 w-1/6 font-semibold text-center">Score</th>
                                        <th className="p-4 w-1/4 font-semibold">Comments</th>
                                        <th className="p-4 w-24">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {items.map((assignment) => (
                                        <tr key={assignment.assignment_id} className="border-b border-[#222] hover:bg-[#151515] transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium text-white text-base mb-1">{assignment.name}</div>
                                                <div className="text-gray-500 text-xs">{assignment.description}</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    className="text-xs text-blue-400 border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 rounded-full hover:bg-blue-500/20 transition-colors flex items-center gap-1 mx-auto"
                                                    onClick={() => handleOpenRate(assignment)}
                                                >
                                                    <Info size={12} /> View Rubric
                                                </button>
                                            </td>
                                            <td className="p-4 text-center">
                                                {assignment.self_rating ? (
                                                    <div className="inline-block px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg font-bold text-lg text-white">
                                                        {assignment.self_rating}
                                                    </div>
                                                ) : <span className="text-gray-600">-</span>}
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-2">
                                                    {assignment.self_comment && (
                                                        <div className="text-xs text-gray-400 italic bg-[#1a1a1a] p-2 rounded border border-[#222]">
                                                            <span className="font-bold text-gray-500 not-italic block mb-0.5">You:</span>
                                                            "{assignment.self_comment}"
                                                        </div>
                                                    )}
                                                    {assignment.manager_comment && (
                                                        <div className="text-xs text-blue-200/70 italic bg-blue-900/10 p-2 rounded border border-blue-900/30">
                                                            <span className="font-bold text-blue-400 not-italic block mb-0.5">Manager:</span>
                                                            "{assignment.manager_comment}"
                                                        </div>
                                                    )}
                                                    {!assignment.self_comment && !assignment.manager_comment && <span className="text-gray-600 italic">No comments</span>}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                {assignment.status !== 'Completed' && (
                                                    <button
                                                        onClick={() => handleOpenRate(assignment)}
                                                        className={`p-2 rounded-lg transition-all ${assignment.self_rating
                                                                ? 'bg-[#222] text-gray-300 hover:text-white hover:bg-[#333]'
                                                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20'
                                                            }`}
                                                        title="Rate / Edit"
                                                    >
                                                        {assignment.self_rating ? <MessageSquare size={18} /> : <Target size={18} />}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>

                {/* Rubric/Rating Modal */}
                {selectedAssignment && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#111] border border-[#333] w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedAssignment.name}</h3>
                                    <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mt-1">{selectedAssignment.goal_name}</p>
                                </div>
                                <button onClick={() => setSelectedAssignment(null)} className="p-2 hover:bg-[#222] rounded-full text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                {/* Rubric Selection */}
                                <div className="mb-8">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2"><Target size={16} /> Select Score based on Criteria</h4>
                                    <div className="grid gap-3">
                                        {(() => {
                                            const criteria: Criteria = selectedAssignment.criteria ? JSON.parse(selectedAssignment.criteria) : {};
                                            // Ensure order 10, 5, 1
                                            const order = ['10', '5', '1'];
                                            return order.map((score) => (
                                                <button
                                                    key={score}
                                                    onClick={() => setRating(parseInt(score))}
                                                    className={`relative p-4 rounded-xl border-2 text-left transition-all group ${rating === parseInt(score)
                                                            ? 'bg-blue-600/10 border-blue-500'
                                                            : 'bg-[#1a1a1a] border-[#222] hover:border-[#444]'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border ${rating === parseInt(score) ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#111] text-gray-500 border-[#333]'
                                                            }`}>
                                                            {score}
                                                        </div>
                                                        <div>
                                                            <div className={`font-medium ${rating === parseInt(score) ? 'text-white' : 'text-gray-300'}`}>
                                                                {criteria[score] || 'No criteria defined'}
                                                            </div>
                                                        </div>
                                                        {rating === parseInt(score) && <CheckCircle className="ml-auto text-blue-500" size={24} />}
                                                    </div>
                                                </button>
                                            ));
                                        })()}
                                    </div>
                                </div>

                                {/* Comments */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-2 flex items-center gap-2"><MessageSquare size={16} /> Your Comments / Justification</h4>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Provide specific examples or details supporting your rating..."
                                        className="w-full h-32 bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="p-6 border-t border-[#222] bg-[#151515] flex gap-3 shrink-0">
                                <button
                                    onClick={() => setSelectedAssignment(null)}
                                    className="flex-1 py-3 rounded-xl bg-[#222] hover:bg-[#333] text-gray-300 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitRating}
                                    disabled={submitting || rating === 0}
                                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? 'Saving...' : <><Save size={18} /> Confirm Assessment</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

