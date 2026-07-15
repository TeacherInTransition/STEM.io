import React, { useState } from 'react';
import { ArrowLeft, Play, Terminal, HelpCircle, Sparkles, Send, RefreshCw, Cpu, MessageSquare, BookOpen, Layers } from 'lucide-react';
import { User } from '../types';

interface IntroductionToAISimulatorProps {
  user: User;
  onBack: () => void;
}

const LESSON_TABS = [
  {
    id: 'neuron',
    title: 'Holographic Neuron',
    icon: <Cpu size={16} />,
    description: 'Learn how weights and biases process inputs to make decisions.',
  },
  {
    id: 'tokenizer',
    title: 'NLP Tokenizer',
    icon: <Terminal size={16} />,
    description: 'See how AI converts raw text into numeric tokens.',
  },
  {
    id: 'backprop',
    title: 'Deep Learning Trainer',
    icon: <Layers size={16} />,
    description: 'Adjust learning rates to train a network and decrease loss.',
  }
];

const PRESETS = [
  "What is the difference between AI, Machine Learning, and Deep Learning?",
  "Explain neural network weights and biases to a 10th grader.",
  "Give me an analogy for how generative AI works.",
  "How do large language models predict the next word?"
];

export default function IntroductionToAISimulator({ user, onBack }: IntroductionToAISimulatorProps) {
  const [activeTab, setActiveTab] = useState('neuron');
  
  // Neuron Sandbox State
  const [neuronInput, setNeuronInput] = useState<number>(0.8);
  const [neuronWeight, setNeuronWeight] = useState<number>(1.5);
  const [neuronBias, setNeuronBias] = useState<number>(-0.5);
  const [neuronOutput, setNeuronOutput] = useState<number | null>(null);

  // Tokenizer Sandbox State
  const [tokenizerInput, setTokenizerInput] = useState<string>("Introduction to Artificial Intelligence is awesome!");
  
  // Trainer Sandbox State
  const [learningRate, setLearningRate] = useState<number>(0.1);
  const [epoch, setEpoch] = useState<number>(0);
  const [loss, setLoss] = useState<number>(1.0);
  const [trainingHistory, setTrainingHistory] = useState<{ epoch: number; loss: number }[]>([]);
  const [isTraining, setIsTraining] = useState(false);

  // Gemini Chat Playground State
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: `Greetings Cadet ${user.name}! I am the STEM.io Holographic Instructor. Ask me any question about Artificial Intelligence, neural networks, or prompt engineering to begin your decrypted training file.` }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Neuron Calculator
  const handleCalculateNeuron = () => {
    const rawSum = (neuronInput * neuronWeight) + neuronBias;
    // Sigmoid Activation Function: 1 / (1 + e^-x)
    const activated = 1 / (1 + Math.exp(-rawSum));
    setNeuronOutput(parseFloat(activated.toFixed(4)));
  };

  // Trainer Simulator
  const handleTrainEpoch = () => {
    if (isTraining) return;
    setIsTraining(true);
    let currentEpoch = epoch;
    let currentLoss = loss;
    const history = [...trainingHistory];

    const interval = setInterval(() => {
      currentEpoch += 1;
      // Loss updates based on learning rate
      const step = currentLoss * learningRate * (0.8 + Math.random() * 0.4);
      currentLoss = Math.max(0.01, parseFloat((currentLoss - step).toFixed(4)));
      history.push({ epoch: currentEpoch, loss: currentLoss });

      setEpoch(currentEpoch);
      setLoss(currentLoss);
      setTrainingHistory([...history]);

      if (currentEpoch >= epoch + 5 || currentLoss <= 0.01) {
        clearInterval(interval);
        setIsTraining(false);
      }
    }, 200);
  };

  const handleResetTrainer = () => {
    setEpoch(0);
    setLoss(1.0);
    setTrainingHistory([]);
  };

  // Gemini API Caller
  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || chatInput;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: textToSend };
    setChatLog(prev => [...prev, userMessage]);
    if (!queryText) setChatInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: `You are a helpful, highly futuristic, cybersecurity/cyberpunk-themed AI onboarding instructor for STEM.io. 
The student's name is ${user.name}.
Answer the following question clearly and concisely for a Grade 10 student:
"${textToSend}"` 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setChatLog(prev => [...prev, { role: 'assistant', content: data.result }]);
      } else {
        setChatLog(prev => [...prev, { role: 'assistant', content: `[CRITICAL ERROR] Failed to retrieve response: ${data.error}` }]);
      }
    } catch (error) {
      setChatLog(prev => [...prev, { role: 'assistant', content: `[CONNECTION ERROR] Server-side handshake failed. Please verify API configurations.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Word tokenization simulator helper
  const getTokens = (text: string) => {
    if (!text) return [];
    return text.split(/\s+/).map((word, idx) => ({
      text: word,
      id: Math.floor(Math.abs(Math.sin(idx + word.length)) * 1000) + 100,
      color: `hsl(${(idx * 60) % 360}, 85%, 65%)`
    }));
  };

  const tokens = getTokens(tokenizerInput);

  return (
    <article className="flex-1 flex flex-col bg-[#121214] overflow-hidden text-[#E0E0E6]">
      {/* Top Breadcrumb Bar */}
      <header className="h-[54px] border-b border-[#22252a] px-6 flex items-center gap-4 shrink-0 bg-[#161619]">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#94A3B8] hover:text-[#00FFFF] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> [ Back to Arcade ]
        </button>
        <div className="h-4 w-[1px] bg-[#22252a]"></div>
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[#6366F1]">
          <Sparkles size={14} /> Introduction to AI Simulator
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        
        {/* LEFT COLUMN: Interactive Onboarding Concept Tabs */}
        <section className="border-r border-[#22252a] flex flex-col overflow-hidden bg-[#121214] p-6 gap-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00FFFF] bg-[#00FFFF]/10 px-2 py-0.5 rounded">
              Unit 1: Core Fundamentals
            </span>
            <h1 className="text-2xl font-black uppercase tracking-wider text-[#E0E0E6] mt-2">
              Interactive AI Sandboxes
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1 font-mono">
              Toggle the sandbox nodes to visualize real-time AI logic processing.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-3 gap-2 bg-[#161619] p-1 border border-[#22252a] rounded-lg shrink-0">
            {LESSON_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-2 px-3 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-[#6366F1] text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                    : 'text-[#94A3B8] hover:text-[#E0E0E6] hover:bg-[#22252a]'
                }`}
              >
                {tab.icon}
                <span className="text-[11px]">{tab.title}</span>
              </button>
            ))}
          </div>

          {/* Active Tab Workspace Panel */}
          <div className="flex-1 bg-[#161619] border border-[#22252a] rounded-lg p-6 flex flex-col justify-between overflow-y-auto min-h-[300px]">
            
            {activeTab === 'neuron' && (
              <div className="flex-col flex gap-5 h-full justify-between">
                <div>
                  <h3 className="font-bold text-[#E0E0E6] flex items-center gap-2">
                    <Cpu size={18} className="text-[#00FFFF]" /> 1. The Mathematical Neuron Node
                  </h3>
                  <p className="text-xs text-[#94A3B8] font-mono mt-2 leading-relaxed">
                    An artificial neuron receives input values, multiplies them by <span className="text-[#00FFFF]">Weights</span> (representing connection strength), adds a <span className="text-[#FF00FF]">Bias</span> (the threshold adjustment), and applies an activation function (like Sigmoid) to output a probability between 0 and 1.
                  </p>

                  {/* Interactive Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-[#121214] p-3 border border-[#22252a] rounded">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] mb-1">
                        Input Value (x): {neuronInput}
                      </label>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        value={neuronInput}
                        onChange={(e) => setNeuronInput(parseFloat(e.target.value))}
                        className="w-full accent-[#00FFFF]"
                      />
                    </div>
                    <div className="bg-[#121214] p-3 border border-[#22252a] rounded">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#00FFFF] mb-1">
                        Weight (w): {neuronWeight}
                      </label>
                      <input 
                        type="range" 
                        min="-2" 
                        max="2" 
                        step="0.1"
                        value={neuronWeight}
                        onChange={(e) => setNeuronWeight(parseFloat(e.target.value))}
                        className="w-full accent-[#00FFFF]"
                      />
                    </div>
                    <div className="bg-[#121214] p-3 border border-[#22252a] rounded">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#FF00FF] mb-1">
                        Bias (b): {neuronBias}
                      </label>
                      <input 
                        type="range" 
                        min="-2" 
                        max="2" 
                        step="0.1"
                        value={neuronBias}
                        onChange={(e) => setNeuronBias(parseFloat(e.target.value))}
                        className="w-full accent-[#FF00FF]"
                      />
                    </div>
                  </div>
                </div>

                {/* Animated Output Node Viewport */}
                <div className="bg-[#121214] border border-[#22252a] rounded-lg p-4 mt-4 flex flex-col items-center relative">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] absolute top-2 left-3">
                    Calculated Feedforward Layer
                  </div>
                  
                  <div className="flex items-center justify-center gap-6 mt-4 w-full py-2">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full border border-dashed border-[#94A3B8] flex items-center justify-center font-mono text-xs">
                        {neuronInput}
                      </div>
                      <span className="text-[9px] font-mono text-[#94A3B8] mt-1">Input (x)</span>
                    </div>

                    <div className="text-[#00FFFF] font-mono text-sm animate-pulse">─ w({neuronWeight}) ──▶</div>

                    <div className="w-14 h-14 rounded-full bg-[#6366F1]/10 border-2 border-[#6366F1] flex flex-col items-center justify-center font-mono text-sm font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      ∑ + Bias
                    </div>

                    <div className="text-[#FF00FF] font-mono text-sm animate-pulse">── Sigmoid ──▶</div>

                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-[#00AD7C]/10 border-2 border-[#00AD7C] flex items-center justify-center font-mono text-xs font-black text-[#00AD7C] shadow-[0_0_15px_rgba(0,173,124,0.2)]">
                        {neuronOutput !== null ? neuronOutput : '?'}
                      </div>
                      <span className="text-[9px] font-mono text-[#00AD7C] mt-1">Output (y)</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCalculateNeuron}
                    className="mt-4 px-4 py-2 bg-[#00FFFF] text-[#121214] font-mono font-bold text-xs uppercase tracking-widest rounded hover:scale-105 transition-all cursor-pointer shadow-[0_0_10px_#00FFFF40]"
                  >
                    ⚡ Compute Activation
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'tokenizer' && (
              <div className="flex-col flex gap-4 h-full justify-between">
                <div>
                  <h3 className="font-bold text-[#E0E0E6] flex items-center gap-2">
                    <Terminal size={18} className="text-[#FF9900]" /> 2. NLP Word-to-Token Embeddings
                  </h3>
                  <p className="text-xs text-[#94A3B8] font-mono mt-2 leading-relaxed">
                    AI models cannot read string words directly. Tokenization partitions input text into chunks (sub-words or tokens), and assigns each token a specific numerical index mapping inside a multidimensional matrix vector space.
                  </p>

                  <div className="mt-4">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] mb-1">
                      Interactive Sandbox Input
                    </label>
                    <input 
                      type="text" 
                      value={tokenizerInput}
                      onChange={(e) => setTokenizerInput(e.target.value)}
                      placeholder="Type words here..."
                      className="w-full bg-[#121214] border border-[#22252a] rounded p-3 text-sm font-mono focus:outline-none focus:border-[#FF9900] text-[#E0E0E6]"
                    />
                  </div>
                </div>

                {/* Token Results Viewport */}
                <div className="bg-[#121214] border border-[#22252a] rounded-lg p-4 flex-1 flex flex-col overflow-hidden min-h-[140px] mt-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] mb-2 block">
                    Numeric Tokenized Viewports
                  </span>
                  
                  <div className="flex-1 overflow-y-auto flex flex-wrap gap-2 content-start py-2">
                    {tokens.map((token, idx) => (
                      <div 
                        key={idx}
                        className="flex flex-col items-center bg-[#161619] border border-[#22252a] p-2 rounded min-w-[70px] hover:border-[#FF9900] transition-colors"
                      >
                        <span className="text-xs font-bold" style={{ color: token.color }}>
                          "{token.text}"
                        </span>
                        <div className="h-[1px] w-full bg-[#22252a] my-1"></div>
                        <span className="text-[10px] font-mono text-[#94A3B8]">
                          ID: {token.id}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'backprop' && (
              <div className="flex-col flex gap-4 h-full justify-between">
                <div>
                  <h3 className="font-bold text-[#E0E0E6] flex items-center gap-2">
                    <Layers size={18} className="text-[#39FF14]" /> 3. Deep Learning Loss Trainer
                  </h3>
                  <p className="text-xs text-[#94A3B8] font-mono mt-2 leading-relaxed">
                    AI learns through gradient descent by adjusting learning rates. Choose a <span className="text-[#39FF14]">Learning Rate (η)</span> and trigger simulated epoch runs to observe training optimizations as the prediction loss drops.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-[#121214] p-3 border border-[#22252a] rounded">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] mb-1">
                        Learning Rate (η): {learningRate}
                      </label>
                      <select 
                        value={learningRate} 
                        onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                        className="w-full bg-[#161619] border border-[#22252a] rounded text-xs font-mono p-1 accent-[#39FF14] text-[#E0E0E6]"
                      >
                        <option value="0.01">0.01 (Stable / Slow)</option>
                        <option value="0.1">0.10 (Optimal / Balanced)</option>
                        <option value="0.5">0.50 (Aggressive / High Risk)</option>
                      </select>
                    </div>

                    <div className="bg-[#121214] p-3 border border-[#22252a] rounded flex flex-col justify-center items-center">
                      <span className="text-[10px] font-mono uppercase text-[#94A3B8]">Simulation State</span>
                      <div className="text-sm font-bold font-mono text-[#39FF14] mt-1">
                        Epoch: {epoch} | Loss: {loss}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Graph / Training History Visualizer */}
                <div className="bg-[#121214] border border-[#22252a] rounded-lg p-3 mt-4 h-32 flex flex-col justify-end relative">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] absolute top-2 left-3">
                    Optimization Loss Curve (Gradient descent)
                  </div>
                  
                  {/* Visual simulated graph bars */}
                  <div className="flex items-end gap-1.5 h-16 px-2">
                    {trainingHistory.slice(-20).map((h, idx) => (
                      <div 
                        key={idx}
                        className="bg-[#39FF14] hover:bg-[#00FFFF] transition-colors rounded-t w-full"
                        style={{ height: `${h.loss * 100}%` }}
                        title={`Epoch ${h.epoch}: Loss ${h.loss}`}
                      ></div>
                    ))}
                    {trainingHistory.length === 0 && (
                      <div className="text-xs font-mono text-[#94A3B8]/30 w-full text-center pb-4 uppercase tracking-widest">
                        Node Idle - Launch Training Epoch
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={handleTrainEpoch}
                    disabled={isTraining || loss <= 0.01}
                    className="flex-1 py-2 px-3 bg-[#39FF14] text-[#121214] font-mono font-bold text-xs uppercase tracking-widest rounded hover:scale-105 transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_10px_#39FF1440]"
                  >
                    {isTraining ? "⚡ Optimizing Network..." : "🕹️ Train 5 Epochs"}
                  </button>
                  <button 
                    onClick={handleResetTrainer}
                    className="py-2 px-3 bg-transparent border border-[#22252a] hover:border-[#E0E0E6] text-[#94A3B8] hover:text-[#E0E0E6] font-mono text-xs uppercase tracking-widest rounded transition-all cursor-pointer"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* RIGHT COLUMN: Chat Onboarding Specialist with Gemini */}
        <section className="flex flex-col overflow-hidden bg-[#121214] p-6 gap-6 justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6366F1] bg-[#6366F1]/10 px-2 py-0.5 rounded">
              Holographic Terminal Node
            </span>
            <h1 className="text-2xl font-black uppercase tracking-wider text-[#E0E0E6] mt-2 flex items-center gap-2">
              <MessageSquare size={22} className="text-[#6366F1]" /> Gemini Assistant
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1 font-mono">
              Engage the deep-learning language model sandbox to test alignment and generate STEM responses.
            </p>
          </div>

          {/* Core Chat Log Viewport */}
          <div className="flex-1 bg-[#161619] border border-[#22252a] rounded-lg p-4 overflow-y-auto flex flex-col gap-4 min-h-[250px]">
            {chatLog.map((message, idx) => (
              <div 
                key={idx}
                className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed font-mono ${
                  message.role === 'user' 
                    ? 'bg-[#6366F1]/15 border border-[#6366F1]/40 text-[#E0E0E6] self-end' 
                    : 'bg-[#121214] border border-[#22252a] text-[#94A3B8] self-start'
                }`}
              >
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1 opacity-70">
                  {message.role === 'user' ? 'Cadet (You)' : 'Holo Instructor'}
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="bg-[#121214] border border-[#22252a] rounded-lg p-3 text-xs font-mono text-[#94A3B8] self-start animate-pulse max-w-[85%]">
                <span className="text-[#6366F1] font-bold">●</span> Syncing holographic signal, query transmitting...
              </div>
            )}
          </div>

          {/* Quick Preset Prompts */}
          <div>
            <div className="text-[9px] uppercase tracking-widest text-[#94A3B8] font-mono mb-2">
              Onboarding Quick Queries
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(preset)}
                  disabled={isLoading}
                  className="bg-[#161619] hover:bg-[#22252a] border border-[#22252a] hover:border-[#6366F1] transition-all px-3 py-1.5 rounded-full text-[10px] font-mono text-[#94A3B8] hover:text-[#E0E0E6] cursor-pointer disabled:opacity-50 text-left max-w-full truncate"
                >
                  ⚙️ {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Input Bar */}
          <div className="flex gap-2">
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              placeholder="Query the holographic matrix instructor..."
              disabled={isLoading}
              className="flex-1 bg-[#161619] border border-[#22252a] focus:border-[#6366F1] focus:outline-none rounded-lg px-4 py-3 text-xs font-mono text-[#E0E0E6] placeholder-[#94A3B8]/40"
            />
            <button
              onClick={() => handleSendQuery()}
              disabled={isLoading || !chatInput.trim()}
              className="px-4 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            >
              <Send size={16} />
            </button>
          </div>

        </section>

      </div>
    </article>
  );
}
