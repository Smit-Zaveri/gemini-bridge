export enum UserRole {
  CIVILIAN = 'civilian',
  RESPONDER = 'responder',
  NURSE = 'nurse',
  ADMIN = 'admin',
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: string;
}

export enum IncidentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  VERIFIED = 'verified',
  DISPATCHED = 'dispatched',
  RESOLVED = 'resolved',
}

export enum CriticalityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface Incident {
  id: string;
  reportedBy: string;
  status: IncidentStatus;
  criticalityScore: number;
  criticalityLevel: CriticalityLevel;
  location?: {
    lat: number;
    lng: number;
  };
  locationAddress?: string;
  emergencyType: string;
  summary: string;
  geminiAnalysis?: any;
  mediaUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export enum DispatchStatus {
  DRAFTED = 'drafted',
  CONFIRMED = 'confirmed',
  SENT = 'sent',
  FAILED = 'failed',
}

export interface Dispatch {
  id: string;
  incidentId: string;
  service: string;
  status: DispatchStatus;
  message: string;
  confirmedBy?: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  userId: string;
  fhirPatient?: any;
  mustKnow?: any;
  fullHistory?: any;
  sourceDocuments: string[];
  lastUpdated: string;
}
