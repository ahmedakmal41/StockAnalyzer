import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
    return (
        <div className="space-y-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-2xl mx-auto"
            >
                <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                    Get in <span className="gradient-text">Touch</span>
                </h2>
                <p className="text-[#64748b] text-lg">
                    Have questions about our enterprise analytics or need a custom solution? Our team is here to help you scale.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Info */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-6 space-y-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center">
                                <Mail className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Email Us</p>
                                <p className="text-sm font-semibold text-white">hello@cloudnerve.tech</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center">
                                <Phone className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Call Us</p>
                                <p className="text-sm font-semibold text-white">+1 (555) 000-0000</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Location</p>
                                <p className="text-sm font-semibold text-white">Innovation Center, Tech City</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass p-8"
                    >
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#3b82f6]/30 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#3b82f6]/30 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Message</label>
                                <textarea
                                    rows="4"
                                    placeholder="How can we help you?"
                                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#3b82f6]/30 transition-all resize-none"
                                ></textarea>
                            </div>
                            <button className="flex items-center justify-center gap-2 w-full py-4 rounded-xl gradient-blue text-white font-bold text-sm shadow-xl shadow-[#3b82f6]/20 hover:opacity-90 transition-all">
                                <Send className="w-4 h-4" />
                                Send Message
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
