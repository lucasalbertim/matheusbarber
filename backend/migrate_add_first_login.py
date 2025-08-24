#!/usr/bin/env python3
"""
Script para migrar banco de dados existente e adicionar campo is_first_login
Execute este script se você já tem um banco de dados com administradores
"""

from database import SessionLocal, engine
from models import Base, Admin
from sqlalchemy import text

def migrate_add_first_login():
    """Adicionar campo is_first_login ao banco existente"""
    
    db = SessionLocal()
    
    try:
        # Verificar se a coluna já existe
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'admins' AND column_name = 'is_first_login'
        """))
        
        if result.fetchone():
            print("✅ Campo is_first_login já existe na tabela admins")
            return
        
        # Adicionar a coluna is_first_login
        db.execute(text("""
            ALTER TABLE admins 
            ADD COLUMN is_first_login BOOLEAN DEFAULT TRUE
        """))
        
        # Atualizar registros existentes
        # Se o admin tem username 'admin', é provavelmente o admin padrão
        db.execute(text("""
            UPDATE admins 
            SET is_first_login = TRUE 
            WHERE username = 'admin'
        """))
        
        # Para outros admins, marcar como não primeiro login
        db.execute(text("""
            UPDATE admins 
            SET is_first_login = FALSE 
            WHERE username != 'admin'
        """))
        
        db.commit()
        print("✅ Migração concluída com sucesso!")
        print("   - Campo is_first_login adicionado")
        print("   - Admin padrão (admin) marcado como primeiro login")
        print("   - Outros admins marcados como não primeiro login")
        
    except Exception as e:
        print(f"❌ Erro na migração: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Migrando banco de dados para adicionar campo is_first_login...")
    migrate_add_first_login()