import { motion } from "framer-motion";
import { Link } from 'react-router-dom';

const MotionDiv = motion.div;

const userAvatars = [
    "./assest/6898.jpeg",
    "https://storage.googleapis.com/a1aa/image/5782adf3-6f9c-4303-bf13-df0c70d0e211.jpg",
    "https://storage.googleapis.com/a1aa/image/c89e72ac-9786-4a33-142a-4a7b47bc590d.jpg",
    "https://storage.googleapis.com/a1aa/image/bdf11032-d91a-4588-0dc0-b50e03319b17.jpg",
    "https://storage.googleapis.com/a1aa/image/ebcee12c-446c-4ff5-6488-c732cde78fa3.jpg",
];

const Doc_templates_images = [
    "https://i.ibb.co/v4dWrK1j/Vishnu-Singh.jpg",
    "http://raw.githubusercontent.com/jakegut/resume/refs/heads/master/resume.png",
    "https://i.ibb.co/7HgSdbL/William-Lucas.jpg",
];

const title_desc= {

}

const heroCtas = [
    {
        to: "/templates",
        label: "Build Your Resume",
        variant: "black",
    },
    {
        to: "/templates",
        label: "Get Your Resume Score",
        variant: "white",
    },
];

const docTemplateFrames = [
    {
        bottom: "bottom-12",
        left: "left-8",
        initial: { opacity: 0, x: -30, y: 30 },
        delay: 0.3,
        frameClass: "rotate-2",
    },
    {
        bottom: "bottom-8",
        left: "left-4",
        initial: { opacity: 0, x: -15, y: 15 },
        delay: 0.45,
        frameClass: "rotate-1",
    },
    {
        bottom: "bottom-0",
        left: "left-0",
        initial: { opacity: 0, x: -30, y: 30 },
        delay: 0.6,
        frameClass: "",
    },
];

export default function Hero() {
    return (
        <>

            <div className="mx-4 sm:mx-auto max-w-7xl sm:border-l sm:border-r border-white pb-12">

                <div className="absolute inset-0 -z-10" />

                <section className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8 pt-12  sm:pt-16 lg:pt-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                    <MotionDiv
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-5 sm:space-y-6"
                    >

                        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
                            ATS Check · AI Writer · One-Click Tailoring
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                            Land more interviews with our{" "}
                            <span className="italic text-teal-600">Resume Builder</span>
                        </h1>

                        <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
                            ATS Check, AI Writer, and One-Click Job Tailoring make your resume stand out to recruiters.
                        </p>

                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                            <div className="flex -space-x-2.5">
                                {userAvatars.map((avatar, index) => (
                                    <img
                                        key={index}
                                        alt={`User ${index + 1}`}
                                        className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                                        src={avatar}
                                    />
                                ))}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-slate-900">
                                    <span className="text-teal-600">28,452</span> users landed interviews last month
                                </div>
                                <div className="text-xs text-slate-400">5,268 Reviews · Start for free.</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {heroCtas.map((cta) => {
                                const className =
                                    cta.variant === "black"
                                        ? "inline-flex flex-none w-fit items-center justify-center gap-1.5 rounded-md sm:rounded-none border border-black bg-black px-2 py-2 text-[11px] sm:text-sm font-semibold text-white transition hover:opacity-90"
                                        : "inline-flex flex-none w-fit items-center justify-center gap-1.5 rounded-md sm:rounded-none border border-black bg-white px-2 py-2 text-[11px] sm:text-sm font-semibold text-black transition hover:opacity-90";

                                return (
                                    <Link key={cta.to} to={cta.to} className={className}>
                                        {cta.label}
                                        {cta.variant === "black" && (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M3 12h18" />
                                            </svg>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </MotionDiv>

                    <MotionDiv
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.15 }}
                        className="hidden relative mt-8"
                    >
                        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory">
                            {Doc_templates_images.map((src) => (
                                <div
                                    key={src}
                                    className="snap-start min-w-[260px] sm:min-w-[320px] h-[240px] sm:h-[300px] rounded-2xl overflow-hidden border border-white bg-white/60"
                                >
                                    <img src={src} alt="Resume template preview" className="w-full h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    </MotionDiv>

                    <MotionDiv
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="hidden lg:block relative h-[560px]"
                    >
                        {Doc_templates_images.map((src, idx) => {
                            const pos = docTemplateFrames[idx];

                            return (
                                <motion.div
                                    key={src}
                                    initial={pos.initial}
                                    animate={{ opacity: 1, x: 0, y: 0 }}
                                    transition={{ duration: 0.5, delay: pos.delay }}
                                    className={`absolute ${pos.bottom} ${pos.left} w-full h-full flex items-center justify-center`}
                                >

                                    <div
                                        className={`w-[94%] h-[94%] rounded-2xl overflow-hidden ${pos.frameClass}`}
                                    >
                                        <img src={src} alt="Resume sample" className="w-full h-full object-contain" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </MotionDiv>
                </div>
                </section>
            </div>
        </>
    );
}
