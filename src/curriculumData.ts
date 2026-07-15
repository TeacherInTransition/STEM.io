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

export const curriculum: Subject[] = [
  {
    id: "foundations",
    title: "AI Foundations & Critical Literacy",
    themes: "Bedrock knowledge, pattern recognition vs logic, bias.",
    units: [
      { 
        id: "f1", 
        title: "The AI/ML/DL Nested Box", 
        concept: "Hierarchy", 
        activity: "Drag-and-drop structural sorting", 
        reward: 10, 
        tags: ["Foundational"] 
      },
      { 
        id: "f2", 
        title: "Bias Auditor Toolkit", 
        concept: "Algorithmic bias", 
        activity: "Audit an image classification dataset for class imbalances", 
        reward: 15, 
        tags: ["Data Justice"] 
      }
    ]
  },
  {
    id: "systems",
    title: "Computing Systems & Networks",
    themes: "CPU/GPU hardware boundaries, ISPO framework, Internet protocols.",
    units: [
      { 
        id: "s1", 
        title: "Silicon Race: CPU vs GPU", 
        concept: "Parallel processing architecture", 
        activity: "Allocate compute tasks to the right hardware unit", 
        reward: 15, 
        tags: ["CSTA Aligned"] 
      },
      { 
        id: "s2", 
        title: "The Packet Tracer Matrix", 
        concept: "TCP/IP & DNS handshakes", 
        activity: "Route packets manually through a simulated terminal switch map", 
        reward: 20, 
        tags: ["IGCSE 0478"] 
      }
    ]
  },
  {
    id: "cyber",
    title: "Cybersecurity & Data Science",
    themes: "Deepfakes, adversarial attacks, encryption, data visualization.",
    units: [
      { 
        id: "c1", 
        title: "Phish Detector Simulation", 
        concept: "AI-driven social engineering vectors", 
        activity: "Dissect a suspicious prompt header to spot engineering flags", 
        reward: 15, 
        tags: ["Defense"] 
      },
      { 
        id: "c2", 
        title: "The Scatterplot Sleuth", 
        concept: "Outlier cleaning & data visualization", 
        activity: "Filter noisy CSV columns to expose a clear linear relationship trend", 
        reward: 20, 
        tags: ["Insights"] 
      }
    ]
  },
  {
    id: "vibe",
    title: "Vibe Coding & Machine Learning Prototyping",
    themes: "Natural language strategic architecture, Teachable Machine, Firebase infrastructure.",
    units: [
      { 
        id: "v1", 
        title: "Prompt-to-App Blueprinting", 
        concept: "Framing high-fidelity specs", 
        activity: "Reconstruct a functional snake game by managing iterative prompts", 
        reward: 20, 
        tags: ["Vibe Essentials"] 
      },
      { 
        id: "v2", 
        title: "Teachable Vision Box", 
        concept: "Real-time image model fine-tuning", 
        activity: "Train web-camera data classes to control a game sprite", 
        reward: 15, 
        tags: ["Prototyping"] 
      }
    ]
  },
  {
    id: "deep",
    title: "Deep Learning & Autonomous Agents",
    themes: "Neural network node configurations, backpropagation mechanics, PARTS prompt engineering, PAT loop.",
    units: [
      { 
        id: "d1", 
        title: "The Hidden Layer Adjuster", 
        concept: "Neural network weight adjustments", 
        activity: "Manually adjust mathematical hidden layers to clear error loss boundaries", 
        reward: 25, 
        tags: ["Deep Learning"] 
      },
      { 
        id: "d2", 
        title: "Perceive-Think-Act Sandbox", 
        concept: "Closed autonomous loops", 
        activity: "Program an AI bot agent to navigate a maze using conditional sensor logic", 
        reward: 25, 
        tags: ["Agents Intro"] 
      }
    ]
  },
  {
    id: "capstone",
    title: "Professional Deployment & Synthesis",
    themes: "3-test validation cycle, multi-agent mesh communication, IGCSE/IB exam collection mapping.",
    units: [
      { 
        id: "cp1", 
        title: "The 3-Test Failure Tracker", 
        concept: "Stress-testing software limits", 
        activity: "Execute boundary inputs on an agent to locate code logic failures", 
        reward: 20, 
        tags: ["Agent Iteration"] 
      },
      { 
        id: "cp2", 
        title: "Portfolio Evidence Compactor", 
        concept: "Project architecture documentation", 
        activity: "Formulate structural code summaries mapped to classic mark schemes", 
        reward: 15, 
        tags: ["IB Topic A.4"] 
      }
    ]
  }
];
