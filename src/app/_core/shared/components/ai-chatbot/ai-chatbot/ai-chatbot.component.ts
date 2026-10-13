import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
}

interface KnowledgeEntry {
  keywords: string[];
  answer: string;
}

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chatbot.component.html',
  styleUrls: ['./ai-chatbot.component.scss']
})
export class AiChatbotComponent implements OnInit, OnDestroy {

  isOpen = false;
  userInput = '';
    messages: ChatMessage[] = [
    { from: 'bot', text: 'Hi! I can answer questions about this app. Try "what is a flat number" or "what is card encoding".' }
  ];
   isListening = false;
  voiceSupported = false;
  speechSupported = false;
  isTyping = false;

    @ViewChild('chatBody') chatBody!: ElementRef<HTMLDivElement>;

  private recognition: any = null;

  // ── Knowledge base: seed with common app FAQs. Extend anytime. ──────────
  private knowledgeBase: KnowledgeEntry[] = [
    { keywords: ['nrd', 'neighbourhood', 'neighborhood'], answer: 'NRD (Neighbourhood) represents a project/site — for example a township or society. Every building, card holder and controller belongs to one NRD.' },
    { keywords: ['flat number', 'flat no'], answer: 'Flat Number identifies a specific unit inside a building, used to link residents, tenants and vehicles to their home.' },
    { keywords: ['card encoding', 'encode', 'encoded'], answer: 'Card Encoding is the process of writing access data onto a physical RFID card so it can be used at readers/controllers.' },
    { keywords: ['card issued', 'total card', 'blocked card'], answer: 'The Card Summary on the Dashboard shows Total cards, Card Issued (Encoded) and Blocked (Non-Encoded) counts, each with a per-project breakdown on hover.' },
    { keywords: ['controller', 'reader'], answer: 'Controllers (Readers) are the physical access-control devices installed at gates. The Dashboard shows how many are Connected vs Disconnected, plus device type (RFID, FastTag-UHF, QR, AI Face Recognition).' },
    { keywords: ['anpr', 'camera'], answer: 'ANPR Cameras automatically read vehicle number plates at entry/exit points. The Dashboard shows Connected vs Disconnected camera counts per project.' },
    { keywords: ['vehicle in out', 'vehicle register', 'authorized vehicle'], answer: 'Vehicle In-Out Register shows authorized vehicle entries and exits with camera captured images, filterable by date, building, vehicle type and project.' },
    { keywords: ['unauthorized vehicle'], answer: 'Unauthorized Vehicles report lists vehicle movements that did not match a registered vehicle in the system.' },
    { keywords: ['visitor', 'guest'], answer: 'Guests and Visitors are temporary card holders with a validity period (Valid From / Valid Till) linked to a resident they are visiting.' },
    { keywords: ['tenant'], answer: 'A Tenant is a card holder renting a unit, tracked with Agreement From/To dates and Cot Basis or Regular tenancy type.' },
    { keywords: ['contractor'], answer: 'Contractors are service personnel linked to a Service Type, Company/Agency, and a validity period for site access.' },
    { keywords: ['employee'], answer: 'Employees are staff card holders, optionally also flagged as Residents, linked to a Project and Date of Joining.' },
    { keywords: ['dashboard'], answer: 'The Dashboard gives a live overview: card holder counts by type, card summary, controller/vehicle/camera status, and today\'s authorized vs unauthorized vehicle traffic.' },
    { keywords: ['who are you', 'what can you do', 'help'], answer: 'I can answer questions about this application and open any page for you — just ask, in text or by voice.' }
  ];

    constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.setupSpeechRecognition();
    this.speechSupported = 'speechSynthesis' in window;
  }

  ngOnDestroy(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
    window.speechSynthesis?.cancel();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }



  // ── Web Speech API: voice input ──────────────────────────────────────────
  private setupSpeechRecognition(): void {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      this.voiceSupported = false;
      return;
    }
    this.voiceSupported = true;
    this.recognition = new SpeechRecognitionCtor();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.userInput = transcript;
      this.sendMessage();
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.onerror = () => {
      this.isListening = false;
    };
  }

  toggleVoiceInput(): void {
    if (!this.voiceSupported || !this.recognition) return;
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      this.recognition.start();
      this.isListening = true;
    }
  }

  private speak(text: string): void {
    if (!this.speechSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }

  // ── Main send handler ─────────────────────────────────────────────────────
   // ── Main send handler ─────────────────────────────────────────────────────
  sendMessage(): void {
    const raw = this.userInput.trim();
    if (!raw) return;

    this.messages.push({ from: 'user', text: raw });
    this.userInput = '';
    setTimeout(() => this.scrollToBottom(), 50);

    // Try local handling first: navigation commands + known FAQ answers (instant, free)
    const localReply = this.handleQuery(raw);
    if (localReply) {
      this.messages.push({ from: 'bot', text: localReply });
      this.speak(localReply);
      setTimeout(() => this.scrollToBottom(), 50);
      return;
    }

    // Fall back to the backend AI endpoint for open-ended questions
    this.isTyping = true;
    this.authService.askAI(raw).subscribe({
      next: (res: any) => {
        this.isTyping = false;
        const reply = res?.reply || "Sorry, I couldn't get a response right now.";
        this.messages.push({ from: 'bot', text: reply });
        this.speak(reply);
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => {
        this.isTyping = false;
        const reply = "I'm having trouble reaching the assistant right now. Please try again in a moment.";
        this.messages.push({ from: 'bot', text: reply });
        this.speak(reply);
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  private scrollToBottom(): void {
    if (this.chatBody) {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    }
  }

    // ── Intent routing: FAQ lookup only. Returns null if nothing matched       ──
  // ── locally, so the caller falls back to the AI backend.                   ──
  private handleQuery(query: string): string | null {
    const lower = query.toLowerCase().trim();
    return this.findBestFaqMatch(lower);
  }

  private findBestFaqMatch(query: string): string | null {
    let best: KnowledgeEntry | null = null;
    let bestScore = 0;
    for (const entry of this.knowledgeBase) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (query.includes(kw)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }
    return bestScore > 0 ? best!.answer : null;
  }
}