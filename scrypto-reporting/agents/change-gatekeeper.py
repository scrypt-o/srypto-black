#!/usr/bin/env python3

"""
Scrypto Change Management Gatekeeper
AI-powered system that reviews all proposed changes for spec compliance,
impact analysis, and medical safety before implementation
"""

import os
import json
import sqlite3
from typing import Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path
import openai

class ScryptoChangeGatekeeper:
    def __init__(self, db_path: str = "scrypto-intelligence.db"):
        self.db_path = db_path
        self.openai_client = openai.OpenAI()
        
        # Change approval criteria
        self.approval_criteria = {
            'spec_compliance': 'Must follow existing Scrypto architectural patterns',
            'security_review': 'Must maintain RLS, authentication, and CSRF protection',
            'medical_safety': 'Must not compromise patient data security or safety',
            'testing_required': 'Must include appropriate test coverage',
            'documentation': 'Must update relevant specifications',
            'impact_assessment': 'Must analyze effect on existing features'
        }
    
    def submit_change_request(self, 
                             requested_by: str,
                             request_type: str,
                             description: str) -> Dict[str, Any]:
        """Submit a new change request for AI review"""
        
        print(f"📝 Submitting change request: {description[:50]}...")
        
        # Generate AI analysis
        analysis = self.analyze_change_impact(description)
        
        # Determine risk level
        risk_level = self.assess_risk_level(analysis, request_type)
        
        # Store in database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO change_requests 
            (requested_by, request_type, description, impact_analysis, risk_level, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            requested_by,
            request_type,
            description,
            analysis['full_analysis'],
            risk_level,
            'ai_reviewed'
        ))
        
        request_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Generate recommendation
        recommendation = self.generate_recommendation(analysis, risk_level)
        
        return {
            'request_id': request_id,
            'risk_level': risk_level,
            'analysis': analysis,
            'recommendation': recommendation,
            'status': 'ai_reviewed',
            'next_steps': self.get_next_steps(risk_level)
        }
    
    def analyze_change_impact(self, description: str) -> Dict[str, Any]:
        """Comprehensive AI analysis of proposed change"""
        
        # Get relevant specifications and code context
        context = self.get_change_context(description)
        
        system_prompt = """You are a Scrypto architecture analyst and medical software expert.
        Analyze the proposed change against these criteria:

        1. **Spec Compliance**: Does it follow Scrypto patterns (SSR-first, TanStack Query, RLS)?
        2. **Security Impact**: Authentication, CSRF, data isolation effects?
        3. **Medical Safety**: Any patient data security or safety implications?
        4. **Feature Dependencies**: What existing features are affected?
        5. **Testing Requirements**: What tests need to be added/updated?
        6. **Implementation Complexity**: Development effort and risk assessment?

        Provide specific, actionable analysis with risk assessment.
        Flag any concerns that could affect patient safety or data security.
        
        Response format:
        **RISK LEVEL**: Critical/High/Medium/Low
        **SPEC COMPLIANCE**: Analysis
        **SECURITY IMPACT**: Analysis  
        **MEDICAL SAFETY**: Analysis
        **AFFECTED FEATURES**: List
        **TESTING REQUIRED**: List
        **IMPLEMENTATION PLAN**: Steps
        **RECOMMENDATIONS**: Specific guidance"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Analyze this change:\n\n{description}\n\nRelevant Context:\n{context}"}
        ]
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                max_tokens=2000,
                temperature=0.1  # Low temperature for consistent analysis
            )
            
            analysis_text = response.choices[0].message.content
            
            # Extract risk level from analysis
            risk_indicators = {
                'critical': ['patient safety', 'data breach', 'security vulnerability', 'authentication bypass'],
                'high': ['database schema', 'API breaking change', 'authentication'],
                'medium': ['UI component', 'validation change', 'new feature'],
                'low': ['styling', 'text change', 'minor enhancement']
            }
            
            detected_risk = 'low'
            for risk_level, indicators in risk_indicators.items():
                if any(indicator in description.lower() or indicator in analysis_text.lower() 
                      for indicator in indicators):
                    detected_risk = risk_level
                    break
            
            return {
                'full_analysis': analysis_text,
                'detected_risk': detected_risk,
                'context_used': len(context),
                'analysis_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'full_analysis': f"Analysis failed: {str(e)}",
                'detected_risk': 'high',  # Fail safe
                'error': True
            }
    
    def get_change_context(self, description: str) -> str:
        """Get relevant context for change analysis"""
        # This would use vector similarity search in full implementation
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Simple keyword-based context retrieval for now
        keywords = description.lower().split()
        context_parts = []
        
        for keyword in keywords[:5]:  # Limit to 5 keywords
            cursor.execute("""
                SELECT title, content FROM specifications 
                WHERE LOWER(content) LIKE ? OR LOWER(title) LIKE ?
                LIMIT 2
            """, (f'%{keyword}%', f'%{keyword}%'))
            
            for title, content in cursor.fetchall():
                context_parts.append(f"**{title}**:\n{content[:500]}...")
        
        conn.close()
        return "\n\n".join(context_parts[:5])  # Limit context size
    
    def assess_risk_level(self, analysis: Dict[str, Any], request_type: str) -> str:
        """Determine risk level based on analysis and request type"""
        
        if analysis.get('error'):
            return 'high'  # Fail safe for analysis errors
        
        detected_risk = analysis.get('detected_risk', 'medium')
        
        # Escalate risk based on request type
        if request_type in ['feature', 'refactor']:
            if detected_risk == 'low':
                detected_risk = 'medium'
        
        return detected_risk
    
    def generate_recommendation(self, analysis: Dict[str, Any], risk_level: str) -> str:
        """Generate implementation recommendation based on analysis"""
        
        if risk_level == 'critical':
            return "❌ REJECT - Critical safety or security concerns identified. Requires architectural review."
        elif risk_level == 'high':
            return "⚠️ REQUIRES APPROVAL - High impact change. Needs senior developer review and comprehensive testing."
        elif risk_level == 'medium':
            return "✅ APPROVE WITH CONDITIONS - Implement with required testing and documentation updates."
        else:
            return "✅ APPROVE - Low risk change. Follow standard implementation process."
    
    def get_next_steps(self, risk_level: str) -> List[str]:
        """Get required next steps based on risk level"""
        
        if risk_level == 'critical':
            return [
                "Schedule architecture review meeting",
                "Document security implications", 
                "Consider alternative approaches",
                "Engage medical safety review"
            ]
        elif risk_level == 'high':
            return [
                "Senior developer review required",
                "Create comprehensive test plan",
                "Update affected specifications",
                "Plan rollback strategy"
            ]
        elif risk_level == 'medium':
            return [
                "Implement following Scrypto patterns",
                "Add appropriate test coverage",
                "Update relevant documentation",
                "Verify with stakeholders"
            ]
        else:
            return [
                "Follow standard implementation process",
                "Add basic test coverage",
                "Update documentation if needed"
            ]
    
    def approve_change(self, request_id: int, approved_by: str, notes: str = "") -> bool:
        """Approve a change request"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE change_requests 
            SET status = 'approved', 
                completion_notes = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (f"Approved by {approved_by}. {notes}", request_id))
        
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        return success
    
    def reject_change(self, request_id: int, rejected_by: str, reason: str) -> bool:
        """Reject a change request"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE change_requests 
            SET status = 'rejected',
                completion_notes = ?,
                updated_at = CURRENT_TIMESTAMP  
            WHERE id = ?
        """, (f"Rejected by {rejected_by}. Reason: {reason}", request_id))
        
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        return success
    
    def get_pending_changes(self) -> List[Dict[str, Any]]:
        """Get all pending change requests"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, requested_by, request_type, description, risk_level, status, created_at
            FROM change_requests 
            WHERE status IN ('submitted', 'ai_reviewed')
            ORDER BY 
                CASE risk_level 
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2  
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                END,
                created_at DESC
        """)
        
        results = []
        for row in cursor.fetchall():
            results.append({
                'id': row[0],
                'requested_by': row[1],
                'request_type': row[2],
                'description': row[3],
                'risk_level': row[4],
                'status': row[5],
                'created_at': row[6]
            })
        
        conn.close()
        return results

def main():
    """Demo the change gatekeeper system"""
    gatekeeper = ScryptoChangeGatekeeper()
    
    print("🛡️ Scrypto Change Gatekeeper Demo")
    print("=" * 50)
    
    # Test different types of changes
    test_changes = [
        {
            'requested_by': 'developer@scrypto.com',
            'type': 'feature',
            'description': 'Add new allergic_reactions field to patient allergies table for tracking severity levels'
        },
        {
            'requested_by': 'stakeholder@scrypto.com', 
            'type': 'enhancement',
            'description': 'Update pharmacy validation workstation to show medication cost estimates'
        },
        {
            'requested_by': 'developer@scrypto.com',
            'type': 'bug_fix', 
            'description': 'Fix TypeScript compilation errors in authentication middleware'
        }
    ]
    
    for change in test_changes:
        print(f"\n📋 CHANGE REQUEST: {change['description']}")
        print("-" * 60)
        
        result = gatekeeper.submit_change_request(
            change['requested_by'],
            change['type'], 
            change['description']
        )
        
        print(f"🎯 Risk Level: {result['risk_level'].upper()}")
        print(f"💡 Recommendation: {result['recommendation']}")
        print(f"📋 Next Steps:")
        for step in result['next_steps']:
            print(f"   • {step}")
        print()

if __name__ == "__main__":
    main()