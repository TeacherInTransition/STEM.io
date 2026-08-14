export interface MasterLesson {
  id: string;
  lessonNumber: number;
  title: string;
  weekNumber: number;
  weekTheme: string;
  tierLevel: 1 | 2 | 3;
  concepts: string;
  standards: string;
  mathLoad: string;
  description: string; // Clean student-facing objective
  warmUp: {
    title: string;
    duration: string;
    activity: string;
    pedagogicalConnection: string;
  };
  instructionAndSandbox: {
    title: string;
    duration: string;
    directInstruction: string;
    collaborativeActivity: string;
  };
  exitTicket: {
    title: string;
    duration: string;
    prompt: string;
  };
  quiz?: any[];
}

export interface UnitMasterPlan {
  unitId: string;
  unitTitle: string;
  pacing: string;
  tiers: string;
  curriculumAlignment: string;
  lessons: MasterLesson[];
}

export const UPDATED_PROBLEM_SOLVING_AI_QUIZ = [
  {
    question: "Question 1: Defining Artificial Intelligence (AI)\nWhat is the correct definition of artificial intelligence (AI) as explored in our lesson and Unit Guide [Problem Solving with AI Unit Guide.pdf]?",
    options: [
      "A. A physical robotic machine that has human-like feelings, consciousness, and independent memory.",
      "B. A technology that mimics human intelligence, performing tasks such as understanding language, recognizing patterns, and making decisions.",
      "C. A computer hardware component that manually runs logic instructions without utilizing data.",
      "D. A digital search engine that can only find and display pre-written web links from the internet.",
      "E. A software program built exclusively to generate musical beats and audio files in a recording studio."
    ],
    correctIndex: 1,
    correctAnswer: 1,
    explanation: "AI refers to technology that mimics human intelligence, performing tasks such as understanding language, recognizing patterns, and making decisions.",
    hint: "Focus on technology that mimics human capabilities like language understanding and pattern recognition."
  },
  {
    question: "Question 2: Understanding Next-Token Probability\nWhen a chatbot predicts the next word in a sentence (such as completing the phrase \"The dog barked at the...\"), what mechanism is it primarily using to decide the output [Problem-Solving-with-AI.pdf]?",
    options: [
      "A. It uses connected camera sensors to see what is physically happening in the classroom.",
      "B. It calculates the statistical likelihood, or probability, that a specific word should follow the preceding text based on patterns in its training data.",
      "C. It logically reasons and understands the real-world physical relationship between a dog and a mailman.",
      "D. It searches its operating system to find a single, hardcoded rule that forces it to choose \"mailman.\"",
      "E. It picks a completely random word from the dictionary without analyzing the preceding words in the prompt."
    ],
    correctIndex: 1,
    correctAnswer: 1,
    explanation: "Chatbots predict the next token by calculating statistical likelihoods from patterns in training data.",
    hint: "Recall statistical likelihoods and probabilities based on training data."
  },
  {
    question: "Question 3: The Role of a Prompt and the Iteration Loop\nWhich of the following best describes a prompt and the \"Golden Rule\" of prompt engineering we practiced in our Code.org sandbox [Problem-Solving-with-AI.pdf]?",
    options: [
      "A. An automatic security warning that alerts you when a virus is attempting to access your laptop files.",
      "B. A physical connection cord used to link your computer keyboard to an external monitor screen.",
      "C. A hidden programming code that students are locked out from editing or viewing during class.",
      "D. A question, instruction, scenario, or statement provided by the user to guide the AI's response, which should be refined through at least three back-and-forth interactions.",
      "E. A short, single-word search term that can never be modified or expanded once it is sent to the chatbot."
    ],
    correctIndex: 3,
    correctAnswer: 3,
    explanation: "A prompt guides the AI response and should be refined iteratively through back-and-forth interactions.",
    hint: "Look for user guidance and iterative back-and-forth refinement."
  },
  {
    question: "Question 4: Analyzing the Giant \"Key on the Table\" Error\nWhen an image generator draws a giant, car-sized key sitting awkwardly on top of a tiny table because of the prompt \"a key on the table,\" what does this error prove about how AI processes data [Problem-Solving-with-AI.pdf]?",
    options: [
      "A. The AI focused on the important key nouns (abstraction) but failed to consider physical scale and context, proving it relies on probability patterns rather than actual logic.",
      "B. The user’s laptop screen was corrupted, which caused a temporary display layout error in the browser.",
      "C. The system ran out of cloud storage space, forcing it to compress the scale of the table to fit the screen.",
      "D. An engineer manually hardcoded the model to always render keys larger than tables as a safety limit.",
      "E. The AI used deep learning backpropagation to intentionally trick the user as a creative joke."
    ],
    correctIndex: 0,
    correctAnswer: 0,
    explanation: "The AI abstracts key nouns but lacks true physical scale or contextual reasoning.",
    hint: "The AI isolates key nouns (abstraction) without genuine scale/context logic."
  },
  {
    question: "Question 5: The Definition of Abstraction\nWhich of the following is the exact definition of abstraction as used in computational thinking and AI design [Problem Solving with AI Unit Guide.pdf]?",
    options: [
      "A. Focusing on the important information and ignoring irrelevant details.",
      "B. Counting the exact mathematical coordinates of pixels in a high-resolution color photo.",
      "C. Creating a backup copy of a computer's operating system in case of hardware failure.",
      "D. Writing an essay using complex academic terms to make a chatbot sound highly professional.",
      "E. Training a computer system to run multiple physical server stacks simultaneously without overheating."
    ],
    correctIndex: 0,
    correctAnswer: 0,
    explanation: "Abstraction in computational thinking means focusing on essential details and ignoring irrelevant information.",
    hint: "Filtering out irrelevant noise to focus on key information."
  }
];

export const UNIT_1_MASTER_PLAN: UnitMasterPlan = {
  unitId: "u1",
  unitTitle: "Unit 1: Problem Solving with AI",
  pacing: "12 Lessons (50 Minutes Each)",
  tiers: "Level 1 (Foundations), Level 2 (Applied Auditing), Level 3 (Ethics & Co-Creation)",
  curriculumAlignment: "Code.org AIF, IGCSE 0478 (Section 6), IB Computer Science (Topic A.4)",
  lessons: [
    {
      id: "u1_l1",
      lessonNumber: 1,
      weekNumber: 1,
      weekTheme: "Core Concepts & Foundations (Level 1)",
      tierLevel: 1,
      title: "Talking to Machines",
      description: "Learn how chatbots use math and probability to predict the next word rather than actually understanding what they say. You will play a \"Yes, and...\" storytelling game to see how adding descriptive details limits the AI's choices and guides it to better answers.",
      concepts: "Next-token prediction, ANI vs. AGI, the ISPO framework.",
      standards: "IGCSE 6.3 (Artificial Intelligence), IB A.4.1 (ML Fundamentals)",
      mathLoad: "Low (Concepts of random chance vs. pattern prediction).",
      warmUp: {
        title: '"Yes, and..." Storytelling',
        duration: "10 min",
        activity: 'Students sit in pairs. One student starts with an opening statement: "A mysterious talking cat started showing up to math class." The next student must build on the story, starting their sentence with "Yes, and..."',
        pedagogicalConnection: 'This game simulates how generative AI works as a "Yes, and..." machine, appending the next most statistically probable word or phrase based on the context that came before.'
      },
      instructionAndSandbox: {
        title: "Token Prediction & Pacing",
        duration: "35 min",
        directInstruction: "Define Artificial Intelligence, ANI, and AGI. Introduce the ISPO (Input-Storage-Processing-Output) framework. Explain that language models process raw text by breaking sentences into fractional units called tokens. Show that the machine does not understand definitions; it calculates how frequently words appear together.",
        collaborativeActivity: 'Direct students to Code.org Lesson 1, Levels 2–4. Students input a generic prompt ("Give me 3 gift ideas") and run it five times, logging how the output varies. They then write a highly specific prompt adding context ("3 gift ideas for a 10-year-old who loves space and building lego rockets").'
      },
      exitTicket: {
        title: "The Probability Space",
        duration: "5 min",
        prompt: '"How do input prompt constraints mathematically reduce the search space of the AI\'s probability engine? Use examples from the gift prompting activity."'
      },
      quiz: UPDATED_PROBLEM_SOLVING_AI_QUIZ
    },
    {
      id: "u1_l2",
      lessonNumber: 2,
      weekNumber: 1,
      weekTheme: "Core Concepts & Foundations (Level 1)",
      tierLevel: 1,
      title: "Beyond Words",
      description: "Explore multimodal AI models that can process both images and text at the same time to solve tasks. You will investigate how computers convert pixels into numbers and identify the hidden personal data you might accidentally share when uploading photos online.",
      concepts: "Multimodal vector processing, pixel brightness arrays, visual pattern extraction.",
      standards: "CSTA 3A-AP-22, IGCSE 6.3 (Computer Vision)",
      mathLoad: "Medium (Mapping 2D coordinate spaces and RGB color values).",
      warmUp: {
        title: "Describe the Canvas",
        duration: "10 min",
        activity: 'Student A looks at a simple drawing of a geometric house. Without naming the objects, they must guide Student B to draw it using only coordinate terms (e.g., "Draw a triangle starting at the top-middle and ending at the margins").',
        pedagogicalConnection: 'Demonstrates how computers cannot natively "see" concepts like "houses" or "trees"; they must translate visual spatial data into mathematical structures.'
      },
      instructionAndSandbox: {
        title: "Grids, Pixels, and Descriptors",
        duration: "35 min",
        directInstruction: "Explain how digital cameras capture light as pixel grids. Map a grayscale image to a 2D matrix where each pixel is represented by a number from 0 (black) to 255 (white). Introduce Multimodal models as systems that can align image pixel matrices and text sequences into a single shared space.",
        collaborativeActivity: "Complete Code.org Lesson 2, Levels 1–2. Students upload an image of an object or animal and prompt the chatbot to describe it. They compare the output of a text-only prompt to a combined text-and-image prompt, analyzing how the image updates the chatbot's focus."
      },
      exitTicket: {
        title: "The Metadata Privacy Audit",
        duration: "5 min",
        prompt: '"List three details (such as location landmarks, time of day, or background text) that a user might unintentionally reveal to an LLM when uploading an image for a visual search."'
      }
    },
    {
      id: "u1_l3",
      lessonNumber: 3,
      weekNumber: 1,
      weekTheme: "Core Concepts & Foundations (Level 1)",
      tierLevel: 1,
      title: "The AI's Brain",
      description: "Find out how AI stores the meanings of words as coordinates called word embeddings. You will rate fictional characters to build a physical coordinate map on the classroom floor, showing how the computer places similar ideas close together like books on a library shelf.",
      concepts: "Word Embeddings, multi-dimensional coordinate tracking, semantic similarity.",
      standards: "IB A.4.2 (Neural Networks), BI-3 (Computers Learn from Data)",
      mathLoad: "Simplified (Replaced high-dimensional vector math with a physical, 3-axis floor coordinate grid).",
      warmUp: {
        title: 'Play "Mind Meld"',
        duration: "10 min",
        activity: 'Two students stand up. On the count of three, they both say a random word. In the next round, they must both try to shout a new word that sits at the semantic "midpoint" of their previous two words (e.g., words were "Fire" and "Water" -> midpoint guess "Steam"). They repeat until they converge on the exact same word.',
        pedagogicalConnection: 'Simulates how language models mathematically calculate the semantic "closeness" or coordinate distance between words.'
      },
      instructionAndSandbox: {
        title: "The Floor Coordinate Grid & The Character Quiz",
        duration: "35 min",
        directInstruction: 'Explain that language models represent word meanings as a sequence of numbers, known as an Embedding. Embeddings serve as an "address" in a massive mathematical library where words with similar meanings are filed close together.',
        collaborativeActivity: "Complete the Character Quiz. Students select a fictional character and rate their personality across three traits on a scale of 1 to 10: Good vs. Evil (X-axis), Outgoing vs. Shy (Y-axis), and Active vs. Passive (Z-axis). Students map their characters as coordinates ([9, 2, 8]) on a 3-axis floor grid and calculate spatial distances."
      },
      exitTicket: {
        title: "Dimensionality Reflection",
        duration: "5 min",
        prompt: '"Why does adding more traits (like stubbornness or intelligence) as additional numbers in our coordinate list make the AI\'s representation of our character more accurate?"'
      }
    },
    {
      id: "u1_l4",
      lessonNumber: 4,
      weekNumber: 2,
      weekTheme: "From Logic to Limitations (Level 1 & 2 Transition)",
      tierLevel: 2,
      title: "Predictable, Not Smart",
      description: "Discover why AI is great at spotting patterns but struggles with simple physical logic. By examining funny mistakes like the \"key on the table\" drawing, you will learn why AI hallucinates false facts and why human oversight is always needed.",
      concepts: "Logic errors, hallucinations, expert systems vs. probabilistic models.",
      standards: "IGCSE 6.3 (Expert Systems vs. Machine Learning)",
      mathLoad: "Low (Logical rule sets vs. statistical approximation).",
      warmUp: {
        title: 'The "Key on the Table" Puzzle',
        duration: "10 min",
        activity: 'Show students a picture generated by an AI based on the prompt: "A key resting on a table." Point out physical anomalies—such as the key floating in mid-air above the table or clipping through the wood. Ask students why a human artist would never make this mistake.',
        pedagogicalConnection: "Demonstrates that AI does not understand real-world physics or logic; it simply generates patterns based on pixel correlations."
      },
      instructionAndSandbox: {
        title: "Rules vs. Guesswork",
        duration: "35 min",
        directInstruction: "Differentiate between Expert Systems (which apply hardcoded rules in an inference engine to a knowledge base to guarantee consistent results) and Generative Models (which guess the most likely output based on training data). Define Hallucination as a model generating false or misleading information that sounds highly confident.",
        collaborativeActivity: "Complete Code.org Lesson 4, Levels 1–4. Students test AI performance across three domains: (1) simple math calculations, (2) creative writing, and (3) tricky riddles. They log failures where the AI creates realistic-sounding but completely incorrect logical leaps."
      },
      exitTicket: {
        title: '"Pass the Mic" Defense',
        duration: "5 min",
        prompt: '"Explain why a medical clinic should never use a raw, unmonitored chatbot to diagnose patients, even if the chatbot passes a biology exam."'
      }
    },
    {
      id: "u1_l5",
      lessonNumber: 5,
      weekNumber: 2,
      weekTheme: "From Logic to Limitations (Level 1 & 2 Transition)",
      tierLevel: 2,
      title: "Uncovering Contradictions",
      description: "See how changing a single word can force a chatbot to completely change its mind and contradict itself. You will practice rewriting biased medical prompts to help a virtual doctor bot give stable, safe, and objective answers.",
      concepts: "Prompt framing, training boundary limits, confirmation bias.",
      standards: "CSTA 3A-IC-24, IB A.4.3.10 (Model Selection and Testing)",
      mathLoad: "Medium (Understanding how inputs shift probability curves).",
      warmUp: {
        title: "Two Truths and a Lie",
        duration: "10 min",
        activity: 'Enter the following prompt into a chatbot: "Tell me 2 truths and a lie about historical space missions. Don\'t tell me which is which." Have students work in pairs to identify the lie using a physical textbook or verified search engine.',
        pedagogicalConnection: "Highlights that probabilistic machines are optimized for plausible-sounding phrasing rather than verifiable truth."
      },
      instructionAndSandbox: {
        title: "Positive vs. Negative Framing",
        duration: "35 min",
        directInstruction: "Explain how the language and structure of a prompt force the model's underlying neural network weights to prioritize specific subsets of its training data. Demonstrating that Framing (introducing emotional or leading adjectives) can force the AI to contradict itself.",
        collaborativeActivity: 'Complete the Telehealth Contradiction Lab. Students analyze a simulated medical chat log. They prompt a chatbot on a health topic using two contrasting frames: (1) "Explain why running in cold weather is highly dangerous," and (2) "Explain the cardiopulmonary benefits of cold-weather running." They document the contradictory advice.'
      },
      exitTicket: {
        title: "Telehealth Remediation",
        duration: "5 min",
        prompt: '"Rewrite the biased running prompts into a single, neutrally-framed prompt that forces the AI to output a balanced, scientifically-grounded comparison."'
      }
    },
    {
      id: "u1_l6",
      lessonNumber: 6,
      weekNumber: 2,
      weekTheme: "From Logic to Limitations (Level 1 & 2 Transition)",
      tierLevel: 2,
      title: "Understanding Bias",
      description: "Explore how human prejudices and narrow perspectives sneak into the training data that AI learns from. You will roleplay as an AI auditor testing a hiring tool to uncover how it leaves out certain people and write a \"3-2-1 bias audit\" to make it fairer.",
      concepts: "Dataset representation, historical skews, systematic algorithmic bias.",
      standards: "IGCSE 6.3 (Data Quality/Bias), IB A.4.4.1 (Algorithmic Fairness)",
      mathLoad: "Medium (Analyzing sample distribution and demographics).",
      warmUp: {
        title: "The Paper Airplane Dataset",
        duration: "10 min",
        activity: 'Have the class quickly collect standard "paper airplanes" built by students. Show that if the class only builds "standard darts" out of white paper, the resulting "training set" is highly biased and will fail to recognize folded glider designs or colored paper as valid airplanes.',
        pedagogicalConnection: "Connects the physical sample skew to the mathematical concept of dataset bias."
      },
      instructionAndSandbox: {
        title: "The Resume Sieve Challenge",
        duration: "35 min",
        directInstruction: 'Explain the principle of "Garbage In, Garbage Out" (GIGO). Detail how historic hiring databases or image archives carry implicit human bias. If a recruitment model is trained on past hiring data dominated by a single demographic, it mathematically codifies those demographics as indicators of success.',
        collaborativeActivity: 'Complete Code.org Lesson 6, Levels 1–5 (AI Audit Challenge). Students act as HR directors filtering job candidates alongside an AI. They audit the system\'s "Fairness Scorecard" to discover how the model automatically penalizes female applicants due to biased keywords.'
      },
      exitTicket: {
        title: "3-2-1 Bias Audit",
        duration: "5 min",
        prompt: '"Document 3 real-world bias examples discovered in class, 2 technical strategies to fix a biased dataset, and 1 root cause of dataset unrepresentativeness."'
      }
    },
    {
      id: "u1_l7",
      lessonNumber: 7,
      weekNumber: 3,
      weekTheme: "Tactical Prompting & Co-Creation (Level 2 & 3 Transition)",
      tierLevel: 2,
      title: "AI's Wild Imagination",
      description: "Study real cases where unverified AI mistakes led to big trouble in courtrooms, clinics, and newspapers. You will learn how Retrieval-Augmented Generation (RAG) anchors an AI to trusted facts and create your own 3-step fact-checking checklist.",
      concepts: "Grounding, verification protocols, Retrieval-Augmented Generation (RAG).",
      standards: "CSTA 3A-IC-25, IB A.4.1.1 (Applications of Natural Language Processing)",
      mathLoad: "Low (Bounded search spaces and database constraints).",
      warmUp: {
        title: "The Fake Newsroom",
        duration: "10 min",
        activity: "Present three short local news stories written by an AI. Two contain verified facts; one contains a highly detailed but completely fabricated citation (e.g., naming a non-existent school board member and meeting date). Students must spot the 'red flags.'",
        pedagogicalConnection: "Trains students to look for specific, unverified assertions that are typical of probabilistic hallucinations."
      },
      instructionAndSandbox: {
        title: "The Grounding Anchor",
        duration: "35 min",
        directInstruction: "Introduce Retrieval-Augmented Generation (RAG). Explain how connecting an LLM to a specific, verified document database (like a textbook PDF) prevents the model from generating random probability associations, keeping its answers 'grounded' in verified facts.",
        collaborativeActivity: "Complete the AI Auditor Case File. Students research high-stakes AI failures (e.g., lawyers citing fake cases in court). They work in pairs to design a human-in-the-loop verification protocol that anchors the AI's research tasks to primary academic sources."
      },
      exitTicket: {
        title: "Verification Protocol",
        duration: "5 min",
        prompt: '"Write a 3-step fact-checking checklist that a high school student must perform before using any AI-generated fact in a history research paper."'
      }
    },
    {
      id: "u1_l8",
      lessonNumber: 8,
      weekNumber: 3,
      weekTheme: "Tactical Prompting & Co-Creation (Level 2 & 3 Transition)",
      tierLevel: 3,
      title: "Debugging and Refining Outputs",
      description: "Master the \"TaCo FoRT\" framework to turn your prompts into reliable instructions. You will learn to treat prompting like writing code, fixing vague instructions by giving the AI a clear Task, Context, Format, Reference, and Tone.",
      concepts: "Natural language debugging, the TaCo FoRT framework, constraint engineering.",
      standards: "CSTA 3A-AP-22 (Computational Artifacts)",
      mathLoad: "Low (Applying structural syntactic constraints).",
      warmUp: {
        title: "The Broken Instructions Game",
        duration: "10 min",
        activity: 'The teacher gives a student a vague instruction: "Make a drawing on the board." The student draws a smiley face. The teacher says: "No, that\'s wrong. I wanted a 3D cube drawn in blue marker." Discuss why the student failed to meet the goal.',
        pedagogicalConnection: "Illustrates that vague prompts fail because they rely on unstated human assumptions."
      },
      instructionAndSandbox: {
        title: "The TaCo FoRT Framework",
        duration: "35 min",
        directInstruction: "Introduce prompt engineering as a form of natural language debugging. Codify the TaCo FoRT prompting formula: Task (command), Context (role/scenario), Format (output structure), Reference (grounding examples), and Tone (style/voice).",
        collaborativeActivity: 'Complete Code.org Lesson 8, Levels 2–5. Students are handed generic prompts (e.g., "Write a summary of the cell cycle") and must systematically rebuild them using the TaCo FoRT framework, logging output improvements.'
      },
      exitTicket: {
        title: "Sticky-Note Debugging",
        duration: "5 min",
        prompt: '"Write a single, fully re-engineered TaCo FoRT prompt that instructs an AI to act as a school counselor generating a weekly study schedule."'
      }
    },
    {
      id: "u1_l9",
      lessonNumber: 9,
      weekNumber: 3,
      weekTheme: "Tactical Prompting & Co-Creation (Level 2 & 3 Transition)",
      tierLevel: 3,
      title: "AI as a Co-Creator",
      description: "Team up with AI as a \"thinking partner\" to design a helpful new product for your school. You will practice breaking down big projects into smaller steps, letting the AI generate early drafts while you stay in control of the final look and voice.",
      concepts: "Task decomposition, human-in-the-loop workflows, collaborative iteration.",
      standards: "CSTA 3A-AP-23, IB A.4.4.1 (Ethics of AI Integration)",
      mathLoad: "Low (Logical process modularization and delegation).",
      warmUp: {
        title: "The AI Essay Critique",
        duration: "10 min",
        activity: 'Display an essay paragraph generated by a raw AI prompt: "Write a personal essay about a time you overcame an obstacle." Have students highlight repetitive phrases, cliché metaphors, and generic transitions.',
        pedagogicalConnection: "Demonstrates where raw machine output lacks original human perspective, voice, and nuance."
      },
      instructionAndSandbox: {
        title: "Human-in-the-Loop & Decomposition",
        duration: "35 min",
        directInstruction: 'Define Decomposition (breaking a massive project down into small, modular steps). Show how a professional uses AI as a "thinking partner"—delegating low-level drafting and data organization while retaining high-level creative control and editing authority.',
        collaborativeActivity: 'Complete Code.org Lesson 9. Working in pairs, students act as "Product Directors" to launch a campaign for a new school-support application. They use AI to brainstorm name ideas, draft slogans, and organize feedback into tables.'
      },
      exitTicket: {
        title: "Collaboration Log",
        duration: "5 min",
        prompt: '"Complete a 2-column log: Column 1: What tasks did the AI accelerate? Column 2: What specific creative edits did you execute to make the output feel authentic and original?"'
      }
    },
    {
      id: "u1_l10",
      lessonNumber: 10,
      weekNumber: 4,
      weekTheme: "Creative Ethics & Master Alignment (Level 3 & Final Stage)",
      tierLevel: 3,
      title: "Remixing, Creativity, and Originality",
      description: "Play with AI Music Lab and run a remix challenge to test the limits of machine creativity. You will use a visual \"temperature thermostat\" dial to see how the computer chooses between safe, predictable words and wild, unexpected ones.",
      concepts: "Probability distribution curves, temperature dials, noise reduction.",
      standards: "IB A.4.3.3 (Model Training and Tuning), IGCSE 6.3 (Machine Learning)",
      mathLoad: "Simplified (Pachinko Probability Tree and Temperature Thermostat).",
      warmUp: {
        title: "Fortunately / Unfortunately",
        duration: "10 min",
        activity: 'Play a fast-paced game of "Fortunately/Unfortunately" around the room. Student A: "Fortunately, we landed on Mars." Student B: "Unfortunately, we forgot the keys to the rocket." Keep story moving in context.',
        pedagogicalConnection: "Models how AI selects its next tokens based on context probability constraints."
      },
      instructionAndSandbox: {
        title: "Pachinko Trees & Temperature Thermostats",
        duration: "35 min",
        directInstruction: "Explain that language models generate text by weighing word probabilities. Use a Pachinko Tree diagram to illustrate pathways. Explain the Temperature Dial: Low Temp (0.2) is predictable; High Temp (1.0) is creative and chaotic.",
        collaborativeActivity: "Direct students to Code.org Lesson 10, Levels 1–5. Students experiment with AI Music Lab, selecting drumming patterns for different cinematic scenes and analyzing how mood descriptors alter beat probability arrays."
      },
      exitTicket: {
        title: "The Synthesis Reflection",
        duration: "5 min",
        prompt: '"Does a model that generates a new drum beat actually exhibit \'creativity,\' or is it simply executing a mathematical rearrangement of pre-existing noise? Support your argument using probability."'
      }
    },
    {
      id: "u1_l11",
      lessonNumber: 11,
      weekNumber: 4,
      weekTheme: "Creative Ethics & Master Alignment (Level 3 & Final Stage)",
      tierLevel: 3,
      title: "Ownership, Ethics, and Creativity",
      description: "Wrestle with the big rules of AI, including copyright, artist consent, and voice cloning. You will debate real-world controversies and work with your class to write an \"AI values charter\" for your school.",
      concepts: "Fair-use criteria, licensing commons, intellectual property, training consent.",
      standards: "IGCSE 6.3 (Ethical Considerations), IB A.4.4.1 (Accountability and Transparency)",
      mathLoad: "Low (Qualitative ethical framework analysis).",
      warmUp: {
        title: "The Reality Check",
        duration: "10 min",
        activity: 'Show students a 10-second clip of a viral video featuring a famous musician\'s voice singing a song they never recorded. Ask: "Should the musician have the right to delete this song from the internet? Why or why not?"',
        pedagogicalConnection: "Connects deepfake technology directly to questions of personal identity and intellectual property."
      },
      instructionAndSandbox: {
        title: "Ethical Debates & Station Rotations",
        duration: "35 min",
        directInstruction: "Detail how generative AI developers scrape public websites to compile training datasets. Introduce the ethical conflict: Does training on copyrighted work constitute 'fair use' or 'data theft'? Introduce FAT principles.",
        collaborativeActivity: "Set up three physical stations: (1) Visual Art & Training Datasets, (2) Voice Cloning & Impersonation, and (3) AI Writing & Educational Integrity. Students rotate through stations debating real-world disputes."
      },
      exitTicket: {
        title: "Value Charter",
        duration: "5 min",
        prompt: '"Choose one primary ethical principle (Consent, Compensation, or Attribution) and write a short defense explaining how future AI developers must integrate it into their systems."'
      }
    },
    {
      id: "u1_l12",
      lessonNumber: 12,
      weekNumber: 4,
      weekTheme: "Creative Ethics & Master Alignment (Level 3 & Final Stage)",
      tierLevel: 3,
      title: "AI's Role in Society",
      description: "Look at the real-world cost of our digital world, including the huge amount of carbon and water used by data centers [712_AI_NOTES]. You will weigh the convenience of local AI tools against their impact on jobs and the environment, then pitch an ethical regulation plan.",
      concepts: "Environmental carbon footprints, resource depletion, technological equity.",
      standards: "IB A.4.4.2 (Environmental and Societal Impacts)",
      mathLoad: "Medium (Computing data center resource metrics).",
      warmUp: {
        title: "The Smart Store Debate",
        duration: "10 min",
        activity: "Present a scenario where a local supermarket replaces all cashier checkouts with automated facial-recognition tracking cameras. Students vote thumbs-up or down.",
        pedagogicalConnection: "Highlights that technology solutions have uneven benefits and costs across different socio-economic groups."
      },
      instructionAndSandbox: {
        title: "The Physical Footprint of the Cloud",
        duration: "35 min",
        directInstruction: "Demystify the 'Cloud.' Explain that every prompt sent to an AI chatbot is routed to massive physical server warehouses. Discuss environmental costs: e-waste, electricity consumption, emissions, and water cooling.",
        collaborativeActivity: "Complete the AI in the Community Worksheet. Students research a specific local AI application (e.g., delivery drones or license plate readers) mapping benefits against social and environmental costs."
      },
      exitTicket: {
        title: "Elevator Pitch",
        duration: "5 min",
        prompt: '"Write a 60-second proposal to our school board recommending whether the school should restrict or expand generative AI use, accounting for both student learning and environmental impact."'
      }
    }
  ]
};

