import { Star, Lock, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";

const levelOrder = ["beginner", "intermediate", "advanced", "expert"] as const;

const levels = [
    {
        level: "Beginner",
        slug: "beginner",
        score: "10–55",
        description: "Build your foundation with basic vocabulary and simple sentence structures",
        tasks: 12,
        color: "cyan" as const,
    },
    {
        level: "Intermediate",
        slug: "intermediate",
        score: "60–90",
        description: "Strengthen comprehension and develop more complex language skills",
        tasks: 18,
        color: "blue" as const,
    },
    {
        level: "Advanced",
        slug: "advanced",
        score: "95–120",
        description: "Refine fluency with academic texts, nuanced writing, and fast-paced listening",
        tasks: 24,
        color: "violet" as const,
    },
    {
        level: "Expert",
        slug: "expert",
        score: "125–160",
        description: "Master high-level reasoning, argumentation, and native-like proficiency",
        tasks: 16,
        color: "violet" as const,
    },
];

const borderMap = {
    cyan: "glow-border-cyan",
    blue: "glow-border-blue",
    violet: "glow-border-violet",
};

const barMap = {
    cyan: "bg-glow-cyan",
    blue: "bg-glow-blue",
    violet: "bg-glow-violet",
};

function getStatusForLevel(slug: string, userLevel: string | null | undefined): "completed" | "active" | "locked" {
    const userIdx = levelOrder.indexOf((userLevel ?? "beginner") as typeof levelOrder[number]);
    const lvlIdx = levelOrder.indexOf(slug as typeof levelOrder[number]);
    if (lvlIdx < userIdx) return "completed";
    if (lvlIdx === userIdx) return "active";
    return "locked";
}

interface TaskLevelsProps {
    compact?: boolean;
}

const TaskLevels = ({ compact = false }: TaskLevelsProps) => {
    const navigate = useNavigate();
    const user = useStore(s => s.user);
    const levelMap = ["beginner", "intermediate", "advanced", "expert"];
    const userLevel = user?.level ? levelMap[user.level - 1] : "beginner";

    return (
        <section className={compact ? "py-2" : "py-16 relative"}>
            <div className={compact ? "" : "container mx-auto px-6"}>
                <div className={compact ? "mb-4 px-2" : "mb-10"}>
                    <h2 className={compact ? "font-display text-xl font-bold mb-1" : "font-display text-3xl font-bold mb-2"}>
                        Practice Levels
                    </h2>
                    <p className={compact ? "text-xs text-muted-foreground" : "text-muted-foreground"}>
                        {compact ? "Reach your target DET score" : "Progress through difficulty tiers to reach your target DET score"}
                    </p>
                </div>

                <div className={`grid grid-cols-1 ${compact ? "gap-3" : "md:grid-cols-2 gap-5"}`}>
                    {levels.map((lvl, i) => {
                        const status = getStatusForLevel(lvl.slug, userLevel);
                        const progress =
                            status === "completed" ? 100 :
                                status === "active" ? 0 :
                                    0;

                        return (
                            <div
                                key={lvl.level}
                                onClick={() => status !== "locked" && navigate(`/task/practice/${lvl.slug}`)}
                                className={`glass rounded-2xl ${compact ? "p-4" : "p-6"} liquid-hover transition-all duration-500 group animate-fade-in ${borderMap[lvl.color]} ${status === "locked" ? "opacity-60" : "hover:scale-[1.01] cursor-pointer"}`}
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className={`flex items-start justify-between ${compact ? "mb-2" : "mb-4"}`}>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-display ${compact ? "text-base" : "text-xl"} font-semibold text-foreground`}>{lvl.level}</h3>
                                            {status === "completed" && <CheckCircle className={`${compact ? "h-3 w-3" : "h-4 w-4"} text-primary`} />}
                                            {status === "locked" && <Lock className={`${compact ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />}
                                        </div>
                                        <span className={`${compact ? "text-[10px]" : "text-xs"} text-muted-foreground`}>DET Score: {lvl.score}</span>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 4 }).map((_, si) => (
                                            <Star
                                                key={si}
                                                className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"} ${si < (status === "completed" ? 4 : status === "active" ? 2 : 0) ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {!compact && (
                                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{lvl.description}</p>
                                )}

                                <div className={compact ? "mb-1" : "mb-4"}>
                                    <div className="flex justify-between text-[10px] mb-1">
                                        <span className="text-muted-foreground">{lvl.tasks} tasks</span>
                                        <span className="text-foreground font-medium">{progress}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${barMap[lvl.color]} transition-all duration-1000`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                {status !== "locked" && !compact && (
                                    <button className="flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {status === "completed" ? "Review" : "Start Practice"}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default TaskLevels;
