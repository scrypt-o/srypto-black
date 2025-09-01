#!/usr/bin/env python3

"""
Scrypto AI Assistant
Multi-level chatbot interface leveraging Ultimate Chat framework
Provides contextual assistance for developers, stakeholders, and clients
"""

import os
import json
import sqlite3
from typing import List, Dict, Any, Optional
from pathlib import Path
from datetime import datetime
import openai

class ScryptoAssistant:
    def __init__(self, db_path: str = "scrypto-intelligence.db"):
        self.db_path = db_path
        self.openai_client = openai.OpenAI()
        
        # User access levels and their capabilities
        self.access_levels = {
            'developer': {
                'name': 'Developer',
                'description': 'Full access to code, specs, implementation guidance',
                'capabilities': ['code_generation', 'spec_analysis', 'impact_analysis', 'technical_details'],
                'context_limit': 50000
            },
            'stakeholder': {
                'name': 'Stakeholder', 
                'description': 'Status reports, progress tracking, business metrics',
                'capabilities': ['status_reports', 'progress_tracking', 'business_metrics'],
                'context_limit': 10000
            },
            'client': {
                'name': 'Client',
                'description': 'Feature status, timeline updates, capability explanations',
                'capabilities': ['feature_status', 'timeline_updates', 'capability_explanations'],
                'context_limit': 5000
            }
        }
    
    def get_relevant_context(self, query: str, user_level: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Retrieve relevant context using vector similarity search"""
        # This would use the vector database created by setup-vector-db.py
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # For now, return basic context - in full implementation, use embeddings
        cursor.execute("""
            SELECT s.title, s.content, s.spec_type, s.file_path
            FROM specifications s
            WHERE s.content LIKE ? OR s.title LIKE ?
            LIMIT ?
        """, (f'%{query}%', f'%{query}%', limit))
        
        results = []
        for row in cursor.fetchall():
            title, content, spec_type, file_path = row
            results.append({
                'title': title,
                'content': content[:1000] + '...' if len(content) > 1000 else content,
                'spec_type': spec_type,
                'file_path': file_path,
                'relevance': 'keyword_match'  # In full implementation, use cosine similarity
            })
        
        conn.close()
        return results
    
    def get_implementation_status(self, feature_query: str) -> Dict[str, Any]:
        """Get current implementation status for features matching query"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT f.*, 
                   COUNT(c.id) as component_count,
                   COUNT(a.id) as api_count,
                   COUNT(t.id) as test_count
            FROM project_features f
            LEFT JOIN code_components c ON f.id = c.feature_id
            LEFT JOIN api_endpoints a ON f.id = a.feature_id  
            LEFT JOIN test_coverage t ON f.id = t.feature_id
            WHERE f.domain LIKE ? OR f.group_name LIKE ? OR f.item LIKE ?
            GROUP BY f.id
        """, (f'%{feature_query}%', f'%{feature_query}%', f'%{feature_query}%'))
        
        results = []
        for row in cursor.fetchall():
            results.append({
                'domain': row[1],
                'group': row[2], 
                'item': row[3],
                'status': row[4],
                'implementation_status': row[5],
                'component_count': row[-3],
                'api_count': row[-2],
                'test_count': row[-1]
            })
        
        conn.close()
        return {'features': results, 'total_found': len(results)}
    
    def generate_response(self, query: str, user_level: str, session_id: str) -> str:
        """Generate AI response based on user level and relevant context"""
        
        # Get user capabilities
        user_config = self.access_levels.get(user_level, self.access_levels['client'])
        
        # Get relevant context
        context_docs = self.get_relevant_context(query, user_level)
        
        # Build context string
        context_parts = []
        for doc in context_docs:
            context_parts.append(f"**{doc['title']}** ({doc['spec_type']}):\n{doc['content']}")
        
        context_text = "\n\n".join(context_parts)
        
        # Truncate context based on user level
        if len(context_text) > user_config['context_limit']:
            context_text = context_text[:user_config['context_limit']] + "\n\n[Context truncated...]"
        
        # Build system prompt based on user level
        if user_level == 'developer':
            system_prompt = """You are a Scrypto development assistant with full access to specifications and code.
            Provide detailed technical guidance, code examples, and implementation advice.
            Follow Scrypto architectural patterns: SSR-first, TanStack Query, Zod validation, RLS security.
            Always reference specific files and line numbers when possible."""
            
        elif user_level == 'stakeholder':
            system_prompt = """You are a Scrypto project manager assistant focused on business metrics and progress.
            Provide clear status updates, timeline information, and business-focused explanations.
            Avoid technical implementation details unless specifically requested."""
            
        else:  # client
            system_prompt = """You are a Scrypto client liaison providing clear, non-technical explanations.
            Focus on feature capabilities, user benefits, and timeline updates.
            Use simple language and avoid technical jargon."""
        
        # Create messages for OpenAI
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context:\n{context_text}\n\nQuestion: {query}"}
        ]
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                max_tokens=1000,
                temperature=0.3
            )
            
            ai_response = response.choices[0].message.content
            
            # Log interaction
            self.log_interaction(session_id, user_level, query, ai_response, context_docs)
            
            return ai_response
            
        except Exception as e:
            return f"I apologize, but I encountered an error: {str(e)}. Please try again."
    
    def log_interaction(self, session_id: str, user_level: str, question: str, response: str, context_used: List[Dict]):
        """Log AI interaction for analytics and improvement"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO ai_interactions 
            (session_id, user_level, question, response, context_used)
            VALUES (?, ?, ?, ?, ?)
        """, (
            session_id,
            user_level,
            question,
            response,
            json.dumps([doc['title'] for doc in context_used])
        ))
        
        conn.commit()
        conn.close()
    
    def analyze_change_impact(self, change_description: str) -> Dict[str, Any]:
        """Analyze the impact of a proposed change using AI"""
        
        # Get relevant context about the change
        context_docs = self.get_relevant_context(change_description, 'developer', limit=10)
        
        # Get related features
        related_features = self.get_implementation_status(change_description)
        
        context_text = "\n\n".join([f"**{doc['title']}**:\n{doc['content']}" for doc in context_docs])
        
        system_prompt = """You are a Scrypto architecture analyst. Analyze the impact of proposed changes.
        Consider: security implications, affected features, testing requirements, deployment risks.
        Provide specific recommendations and flag any medical safety concerns.
        
        Response format:
        **Impact Level**: High/Medium/Low
        **Affected Features**: List specific features
        **Security Implications**: Any security concerns
        **Testing Required**: What tests need to be updated
        **Recommendations**: Specific implementation guidance
        **Medical Safety**: Any patient safety considerations"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Analyze this change:\n{change_description}\n\nContext:\n{context_text}"}
        ]
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                max_tokens=1500,
                temperature=0.2
            )
            
            return {
                'analysis': response.choices[0].message.content,
                'context_docs_used': len(context_docs),
                'related_features': related_features['total_found']
            }
            
        except Exception as e:
            return {'analysis': f"Analysis failed: {str(e)}", 'error': True}

def main():
    """Demo the assistant capabilities"""
    assistant = ScryptoAssistant()
    
    print("🤖 Scrypto AI Assistant Demo")
    print("=" * 50)
    
    # Test different user levels
    test_queries = [
        ("How do I implement a new medical history feature?", "developer"),
        ("What's the current status of the pharmacy portal?", "stakeholder"), 
        ("When will the prescription scanning feature be ready?", "client")
    ]
    
    for query, user_level in test_queries:
        print(f"\n👤 {user_level.upper()} QUERY: {query}")
        print("-" * 50)
        
        response = assistant.generate_response(query, user_level, f"demo-{user_level}")
        print(response)
        print()
    
    # Test change impact analysis
    print("\n🔍 CHANGE IMPACT ANALYSIS")
    print("-" * 50)
    
    change = "Add a new field 'allergic_reactions' to the allergies table"
    impact = assistant.analyze_change_impact(change)
    print(f"Change: {change}")
    print(f"Analysis:\n{impact['analysis']}")

if __name__ == "__main__":
    main()