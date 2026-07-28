export interface Unit {
  id: string;
  title: string;
  concept: string;
  activity: string;
  reward: number;
  tags: string[];
}

export interface Subject {
  id: string;
  title: string;
  themes: string;
  units: Unit[];
}

export const aiFoundationsCurriculum: Subject[] = [
  {
    id: "q1-ai-foundations",
    title: "Quarter 1: AI Foundations",
    themes: "NEW ML + ETHICS",
    units: [
      {
        id: "u1",
        title: "AI vs ML vs DL",
        concept: "AI/ML/DL hierarchy",
        activity: "Explore supervised and unsupervised learning structures.",
        reward: 10,
        tags: ["Foundations"]
      },
      {
        id: "u2",
        title: "Data & Bias",
        concept: "Training data",
        activity: "Identify training data bias and perform detection activities.",
        reward: 15,
        tags: ["Data Justice"]
      },
      {
        id: "u3",
        title: "AI Ethics 101",
        concept: "FAT Framework",
        activity: "Explore fairness, accountability, and transparency.",
        reward: 15,
        tags: ["Ethics"]
      },
      {
        id: "u4",
        title: "Expert Systems",
        concept: "Knowledge & Rule base",
        activity: "Design inference engines for rule-based systems.",
        reward: 20,
        tags: ["IGCSE 0478"]
      }
    ]
  },
  {
    id: "q2-hands-on-ml",
    title: "Quarter 2: Hands-On ML",
    themes: "VIBE CODING",
    units: [
      {
        id: "u5",
        title: "ML Training",
        concept: "Datasets",
        activity: "Train supervised learning models using labeled datasets.",
        reward: 15,
        tags: ["Machine Learning"]
      },
      {
        id: "u6",
        title: "Vibe Coding",
        concept: "Natural Language",
        activity: "Build an app workflow using natural language prompting.",
        reward: 20,
        tags: ["Vibe Coding"]
      },
      {
        id: "u7",
        title: "ML Types",
        concept: "Classification & Regression",
        activity: "Differentiate and apply regression and classification algorithms.",
        reward: 15,
        tags: ["Algorithms"]
      },
      {
        id: "u8",
        title: "Graphs in AI",
        concept: "Pathfinding",
        activity: "Explore knowledge representation and pathfinding techniques.",
        reward: 20,
        tags: ["Data Structures"]
      }
    ]
  },
  {
    id: "q3-deep-learning",
    title: "Quarter 3: Deep Learning",
    themes: "NEURAL NETWORKS",
    units: [
      {
        id: "u9",
        title: "Neural Networks",
        concept: "Network Layers",
        activity: "Configure Input, Hidden, Output layers and backpropagation.",
        reward: 20,
        tags: ["Neural Nets"]
      },
      {
        id: "u10",
        title: "Deep Learning",
        concept: "Feature Extraction",
        activity: "Compare automated feature extraction vs. traditional ML.",
        reward: 20,
        tags: ["Deep Learning"]
      },
      {
        id: "u11",
        title: "AI Agents Intro",
        concept: "Autonomy",
        activity: "Analyze the distinctions between autonomous agents and chatbots.",
        reward: 15,
        tags: ["Agents"]
      },
      {
        id: "u12",
        title: "Generative AI",
        concept: "Gen Models",
        activity: "Experiment with text and image generation models.",
        reward: 15,
        tags: ["Gen AI"]
      }
    ]
  },
  {
    id: "q4-agents-mastery",
    title: "Quarter 4: AI Agents Mastery",
    themes: "GEMINI GEMS",
    units: [
      {
        id: "u13",
        title: "Gem Creator",
        concept: "Custom Gems",
        activity: "Build and deploy custom Gemini Gems for specific tasks.",
        reward: 20,
        tags: ["Gemini"]
      },
      {
        id: "u14",
        title: "Agent Iteration",
        concept: "Debugging",
        activity: "Perform 3-test improvement and debugging cycles on agents.",
        reward: 25,
        tags: ["Iteration"]
      },
      {
        id: "u15",
        title: "Agent Teams",
        concept: "Collaboration",
        activity: "Design multi-agent collaborative workflows and meshes.",
        reward: 30,
        tags: ["Multi-Agent"]
      },
      {
        id: "u16",
        title: "Vibe Coding Agents",
        concept: "Pipeline",
        activity: "Execute a prompt-to-agent-to-app professional development pipeline.",
        reward: 30,
        tags: ["Vibe Coding"]
      }
    ]
  },
  {
    id: "q5-synthesis",
    title: "Quarter 5: Synthesis + Exam Prep",
    themes: "CAPSTONE & REVIEW",
    units: [
      {
        id: "u17",
        title: "Ethics Deep Dive",
        concept: "Explainable AI",
        activity: "Apply FAT frameworks and evaluate explainable AI (XAI).",
        reward: 15,
        tags: ["Ethics"]
      },
      {
        id: "u18",
        title: "IGCSE/IB Review",
        concept: "Exam Practice",
        activity: "Complete syllabus drills and practice exam questions.",
        reward: 20,
        tags: ["Exam Prep"]
      },
      {
        id: "u19",
        title: "Capstone Agent",
        concept: "Real World",
        activity: "Build an autonomous system for a real community problem.",
        reward: 50,
        tags: ["Capstone"]
      },
      {
        id: "u20",
        title: "Exam Portfolio",
        concept: "Evidence",
        activity: "Compile final evidence portfolio and submit for review.",
        reward: 30,
        tags: ["Portfolio"]
      }
    ]
  }
];
