import { AIIntention } from '../types';

const PLATFORM_REQUIREMENTS: Record<string, { size: number; format: string }> = {
  whatsapp: { size: 16 * 1024 * 1024, format: 'mp4' },
  instagram: { size: 30 * 1024 * 1024, format: 'jpg' },
  school: { size: 2 * 1024 * 1024, format: 'pdf' },
  job: { size: 5 * 1024 * 1024, format: 'pdf' },
};

export function parseAICommand(command: string, fileType?: string): AIIntention {
  const cmd = command.toLowerCase();
  let intention: AIIntention = {
    action: 'optimize',
    confidence: 0.7,
    suggestions: [],
    targetSize: undefined,
  };

  // Detect Platform
  for (const [platform, req] of Object.entries(PLATFORM_REQUIREMENTS)) {
    if (cmd.includes(platform)) {
      intention.platform = platform;
      intention.targetSize = req.size;
      intention.format = req.format;
      intention.suggestions.push(`Applying ${platform} standards: ${req.format.toUpperCase()} under ${req.size / (1024 * 1024)}MB`);
      intention.confidence += 0.2;
    }
  }

  // Detect Target Size (e.g., "500KB", "2MB")
  const sizeMatch = cmd.match(/(\d+(?:\.\d+)?)\s*(kb|mb)/i);
  if (sizeMatch) {
    const value = parseFloat(sizeMatch[1]);
    const unit = sizeMatch[2].toLowerCase();
    intention.targetSize = unit === 'kb' ? value * 1024 : value * 1024 * 1024;
    intention.confidence += 0.1;
  }

  // Detect Format Conversion
  if (cmd.includes('convert to') || cmd.includes('to')) {
    const formats = ['pdf', 'jpg', 'png', 'webp', 'mp4', 'webm'];
    for (const f of formats) {
      if (cmd.includes(f)) {
        intention.format = f;
        intention.confidence += 0.1;
        break;
      }
    }
  }

  // Detect Resolution
  if (cmd.includes('resolution') || cmd.includes('x')) {
    const resMatch = cmd.match(/(\d{3,4})x(\d{3,4})/);
    if (resMatch) {
      intention.resolution = `${resMatch[1]}x${resMatch[2]}`;
    }
  }

  // Edge Case: Unrealistic requests
  if (intention.targetSize && intention.targetSize < 10 * 1024) {
    intention.suggestions.push('Warning: Requesting extremely small size may lead to severe quality degradation.');
  }

  // Refine fallback
  if (intention.confidence > 1) intention.confidence = 0.98;
  
  return intention;
}