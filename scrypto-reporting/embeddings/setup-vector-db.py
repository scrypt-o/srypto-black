#!/usr/bin/env python3

"""
Scrypto Vector Database Setup
Extracts content from specs and code, creates embeddings using OpenAI, stores in SQLite
Based on Archon RAG techniques from /_eve_/repos/rag/Archon
"""

import os
import json
import sqlite3
import hashlib
from typing import List, Dict, Any
from pathlib import Path
import openai
from datetime import datetime

class ScryptoVectorDB:
    def __init__(self, db_path: str = "scrypto-intelligence.db"):
        self.db_path = db_path
        self.openai_client = openai.OpenAI()
        self.init_database()
    
    def init_database(self):
        """Initialize the vector database with schema"""
        conn = sqlite3.connect(self.db_path)
        
        # Read and execute schema
        schema_path = Path(__file__).parent.parent / "database" / "schema.sql"
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        conn.executescript(schema_sql)
        conn.close()
        print(f"✅ Database initialized: {self.db_path}")
    
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into overlapping chunks for embedding"""
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunk = text[start:end]
            chunks.append(chunk)
            start = end - overlap
            
        return chunks
    
    def create_embedding(self, text: str) -> List[float]:
        """Create embedding using OpenAI API"""
        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"❌ Embedding failed: {e}")
            return []
    
    def process_specifications(self, specs_dir: str):
        """Process all specification files and create embeddings"""
        print("\n📋 Processing specifications...")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        specs_path = Path(specs_dir)
        
        for spec_file in specs_path.rglob("*.md"):
            if spec_file.name.startswith('.'):
                continue
                
            try:
                with open(spec_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Extract metadata from path
                relative_path = spec_file.relative_to(specs_path)
                path_parts = relative_path.parts
                
                spec_type = path_parts[0] if len(path_parts) > 1 else 'general'
                title = spec_file.stem
                
                print(f"📄 Processing: {relative_path}")
                
                # Create chunks and embeddings
                chunks = self.chunk_text(content)
                
                for i, chunk in enumerate(chunks):
                    if len(chunk.strip()) < 50:  # Skip very small chunks
                        continue
                    
                    embedding = self.create_embedding(chunk)
                    if not embedding:
                        continue
                    
                    # Create unique chunk ID
                    chunk_id = hashlib.md5(f"{relative_path}_{i}_{chunk[:100]}".encode()).hexdigest()
                    
                    # Store embedding
                    cursor.execute("""
                        INSERT OR REPLACE INTO document_embeddings 
                        (source_type, content_chunk, embedding_vector, tags, metadata)
                        VALUES (?, ?, ?, ?, ?)
                    """, (
                        'spec',
                        chunk,
                        json.dumps(embedding),
                        json.dumps([spec_type, title, str(relative_path)]),
                        json.dumps({
                            'file_path': str(spec_file),
                            'relative_path': str(relative_path),
                            'chunk_index': i,
                            'chunk_count': len(chunks),
                            'spec_type': spec_type,
                            'title': title
                        })
                    ))
                
                # Also store in specifications table
                cursor.execute("""
                    INSERT OR REPLACE INTO specifications 
                    (spec_type, title, content, file_path, version)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    spec_type,
                    title,
                    content,
                    str(spec_file),
                    '1.0'
                ))
                
            except Exception as e:
                print(f"❌ Error processing {spec_file}: {e}")
        
        conn.commit()
        conn.close()
        print("✅ Specifications processing complete")
    
    def process_code_files(self, project_dir: str):
        """Process TypeScript/JavaScript files and create embeddings"""
        print("\n💻 Processing code files...")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        project_path = Path(project_dir)
        
        # Focus on key directories
        code_dirs = [
            'app',
            'components', 
            'lib',
            'hooks',
            'schemas',
            'config'
        ]
        
        for dir_name in code_dirs:
            dir_path = project_path / dir_name
            if not dir_path.exists():
                continue
                
            for code_file in dir_path.rglob("*.ts*"):
                if 'node_modules' in str(code_file) or '.next' in str(code_file):
                    continue
                
                try:
                    with open(code_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Skip very large files or binary content
                    if len(content) > 50000 or len(content) < 100:
                        continue
                    
                    relative_path = code_file.relative_to(project_path)
                    
                    # Determine component type
                    if 'page.tsx' in code_file.name:
                        component_type = 'page'
                    elif 'route.ts' in code_file.name:
                        component_type = 'api_route'
                    elif code_file.parent.name == 'schemas':
                        component_type = 'schema'
                    elif code_file.parent.name == 'hooks':
                        component_type = 'hook'
                    elif 'layout' in code_file.name.lower():
                        component_type = 'layout'
                    elif code_file.parent.name == 'config':
                        component_type = 'config'
                    else:
                        component_type = 'component'
                    
                    print(f"💻 Processing: {relative_path}")
                    
                    # Create smaller chunks for code (500 chars with 100 overlap)
                    chunks = self.chunk_text(content, chunk_size=500, overlap=100)
                    
                    for i, chunk in enumerate(chunks):
                        if len(chunk.strip()) < 50:
                            continue
                        
                        embedding = self.create_embedding(chunk)
                        if not embedding:
                            continue
                        
                        cursor.execute("""
                            INSERT OR REPLACE INTO document_embeddings 
                            (source_type, content_chunk, embedding_vector, tags, metadata)
                            VALUES (?, ?, ?, ?, ?)
                        """, (
                            'code',
                            chunk,
                            json.dumps(embedding),
                            json.dumps([component_type, dir_name, code_file.stem]),
                            json.dumps({
                                'file_path': str(code_file),
                                'relative_path': str(relative_path),
                                'component_type': component_type,
                                'directory': dir_name,
                                'chunk_index': i,
                                'lines_of_code': len(content.split('\n'))
                            })
                        ))
                
                except Exception as e:
                    print(f"❌ Error processing {code_file}: {e}")
        
        conn.commit()
        conn.close()
        print("✅ Code processing complete")
    
    def create_project_knowledge_graph(self):
        """Create relationships between features, specs, and code"""
        print("\n🔗 Building knowledge graph...")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Seed project features based on known structure
        features = [
            ('patient', 'medhist', 'allergies', 'completed'),
            ('patient', 'medhist', 'conditions', 'completed'),
            ('patient', 'medhist', 'immunizations', 'completed'),
            ('patient', 'medhist', 'surgeries', 'completed'),
            ('patient', 'medhist', 'family_history', 'completed'),
            ('patient', 'persinfo', 'profile', 'in_progress'),
            ('patient', 'persinfo', 'emergency_contacts', 'completed'),
            ('patient', 'persinfo', 'dependents', 'completed'),
            ('patient', 'carenet', 'caregivers', 'completed'),
            ('patient', 'vitality', 'vital_signs', 'completed'),
            ('pharmacy', 'prescriptions', 'validation', 'completed'),
            ('pharmacy', 'dashboard', 'homepage', 'completed'),
            ('pharmacy', 'navigation', 'sidebar', 'completed')
        ]
        
        for domain, group, item, status in features:
            cursor.execute("""
                INSERT OR REPLACE INTO project_features 
                (domain, group_name, item, implementation_status)
                VALUES (?, ?, ?, ?)
            """, (domain, group, item, status))
        
        conn.commit()
        conn.close()
        print("✅ Knowledge graph seeded")
    
    def semantic_search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant content using semantic similarity"""
        query_embedding = self.create_embedding(query)
        if not query_embedding:
            return []
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get all embeddings and calculate cosine similarity
        cursor.execute("""
            SELECT id, content_chunk, embedding_vector, tags, metadata
            FROM document_embeddings
        """)
        
        results = []
        for row in cursor.fetchall():
            doc_id, content, embedding_json, tags, metadata = row
            
            try:
                doc_embedding = json.loads(embedding_json)
                
                # Calculate cosine similarity
                similarity = self.cosine_similarity(query_embedding, doc_embedding)
                
                results.append({
                    'id': doc_id,
                    'content': content,
                    'similarity': similarity,
                    'tags': json.loads(tags),
                    'metadata': json.loads(metadata)
                })
            except:
                continue
        
        # Sort by similarity and return top results
        results.sort(key=lambda x: x['similarity'], reverse=True)
        conn.close()
        
        return results[:limit]
    
    def cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        import math
        
        if len(a) != len(b):
            return 0.0
        
        dot_product = sum(a[i] * b[i] for i in range(len(a)))
        magnitude_a = math.sqrt(sum(a[i] ** 2 for i in range(len(a))))
        magnitude_b = math.sqrt(sum(b[i] ** 2 for i in range(len(b))))
        
        if magnitude_a == 0 or magnitude_b == 0:
            return 0.0
        
        return dot_product / (magnitude_a * magnitude_b)

def main():
    print("🤖 Scrypto Vector Database Setup")
    print("=" * 50)
    
    # Initialize vector database
    vector_db = ScryptoVectorDB()
    
    # Get project paths
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent.parent
    specs_dir = script_dir.parent / "specs"
    
    print(f"📁 Project directory: {project_dir}")
    print(f"📋 Specs directory: {specs_dir}")
    
    # Process all content
    vector_db.create_project_knowledge_graph()
    vector_db.process_specifications(str(specs_dir))
    vector_db.process_code_files(str(project_dir))
    
    # Test semantic search
    print("\n🔍 Testing semantic search...")
    results = vector_db.semantic_search("How do I implement authentication in Scrypto?")
    
    for i, result in enumerate(results[:3]):
        print(f"\n{i+1}. Similarity: {result['similarity']:.3f}")
        print(f"   Tags: {result['tags']}")
        print(f"   Content preview: {result['content'][:150]}...")
    
    print(f"\n✅ Vector database setup complete!")
    print(f"📊 Database location: {vector_db.db_path}")

if __name__ == "__main__":
    main()