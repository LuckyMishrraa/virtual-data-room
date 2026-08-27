import uuid
from datetime import datetime
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.models.db_models import Base, FileModel, ComplianceFlagModel, PermissionModel, AuditLogModel, UserModel

# Database engine configuration
engine_kwargs = {}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency providing a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes database schema and populates initial sample data if empty."""
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        if db.query(FileModel).count() > 0:
            return

        now = datetime.utcnow().isoformat() + "Z"

        # 1. Seed Users (The 4 Core Roles)
        users = [
            UserModel(
                id="usr-admin-01",
                name="Alexander Vance",
                role="Admin",
                email="alexander.vance@vdr-capital.com",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            ),
            UserModel(
                id="usr-comp-02",
                name="Elena Rostova",
                role="Compliance Officer",
                email="elena.rostova@vdr-capital.com",
                avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
            ),
            UserModel(
                id="usr-adv-03",
                name="Marcus Sterling",
                role="Advisor",
                email="marcus.sterling@sterling-wealth.com",
                avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            ),
            UserModel(
                id="usr-aud-04",
                name="Sarah Chen, CPA",
                role="Auditor",
                email="sarah.chen@deloitte-audit.com",
                avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
            )
        ]
        db.add_all(users)

        # Helper function for default permissions
        def create_permissions(file_id: str):
            return [
                PermissionModel(id=f"perm-{uuid.uuid4().hex[:8]}", file_id=file_id, role="Admin", can_view=True, can_edit=True, can_share=True),
                PermissionModel(id=f"perm-{uuid.uuid4().hex[:8]}", file_id=file_id, role="Compliance Officer", can_view=True, can_edit=True, can_share=True),
                PermissionModel(id=f"perm-{uuid.uuid4().hex[:8]}", file_id=file_id, role="Advisor", can_view=True, can_edit=False, can_share=False),
                PermissionModel(id=f"perm-{uuid.uuid4().hex[:8]}", file_id=file_id, role="Auditor", can_view=True, can_edit=False, can_share=False),
            ]

        # 2. Seed Root Folders
        folder_funds = FileModel(
            id="folder-funds-101",
            name="Fund Alpha - Portfolio Assets",
            parent_id=None,
            is_folder=True,
            size_bytes=0,
            mime_type="inode/directory",
            file_extension="",
            sensitivity="Internal Only",
            created_at=now,
            updated_at=now
        )
        db.add(folder_funds)
        db.add_all(create_permissions(folder_funds.id))

        folder_legal = FileModel(
            id="folder-legal-102",
            name="Legal & Corporate Covenants",
            parent_id=None,
            is_folder=True,
            size_bytes=0,
            mime_type="inode/directory",
            file_extension="",
            sensitivity="Restricted",
            created_at=now,
            updated_at=now
        )
        db.add(folder_legal)
        db.add_all(create_permissions(folder_legal.id))

        # 3. Seed Nested Folders
        folder_sec = FileModel(
            id="folder-sec-201",
            name="2026-Q3 SEC Filings",
            parent_id=folder_funds.id,
            is_folder=True,
            size_bytes=0,
            mime_type="inode/directory",
            file_extension="",
            sensitivity="Confidential",
            created_at=now,
            updated_at=now
        )
        db.add(folder_sec)
        db.add_all(create_permissions(folder_sec.id))

        folder_audits = FileModel(
            id="folder-audits-202",
            name="External Audit Reports",
            parent_id=folder_legal.id,
            is_folder=True,
            size_bytes=0,
            mime_type="inode/directory",
            file_extension="",
            sensitivity="Confidential",
            created_at=now,
            updated_at=now
        )
        db.add(folder_audits)
        db.add_all(create_permissions(folder_audits.id))

        # 4. Seed Files with Compliance Flags
        file_sec_doc = FileModel(
            id="file-sec-301",
            name="SEC_Form_10K_Annual_Report.txt",
            parent_id=folder_sec.id,
            is_folder=False,
            size_bytes=24580,
            mime_type="text/plain",
            file_extension=".txt",
            sensitivity="Confidential",
            storage_key="file-sec-301-SEC_Form_10K_Annual_Report.txt",
            content_preview=(
                "=== UNITED STATES SECURITIES AND EXCHANGE COMMISSION ===\n"
                "FORM 10-K ANNUAL FILING\n"
                "Fiscal Year Ended December 31, 2025\n\n"
                "COMPANY: ACUMEN VDR GLOBAL CAPITAL LP (CIK: 0001894211)\n"
                "==========================================================\n\n"
                "PART I: ITEM 1 - BUSINESS OPERATIONS\n"
                "The Partnership maintains direct investment portfolios across private equity,\n"
                "structured credit facilities, and liquidity arbitrage.\n\n"
                "[COMPLIANCE SECTION 4.2 - MATERIAL DISCLOSURES]\n"
                "The Partnership engaged in structured derivatives hedging with Sovereign Fund Alpha.\n"
                "Beneficiary Accounts: [CONFIDENTIAL IDENTIFIERS REDACTED PER COVENANTS]\n"
                "Risk Exposure: Derivative notional value $120,000,000 against USD/EUR interest swaps.\n\n"
                "[SCHEDULE B - LIQUIDITY AND CAPITAL RESERVES]\n"
                "Total Cash & Cash Equivalents: $450,200,000 USD\n"
                "Tier 1 Capital Adequacy Ratio: 16.4%\n"
                "SEC Rule 17a-4 Record Retention Status: Verified by Chief Compliance Officer."
            ),
            created_at=now,
            updated_at=now
        )
        db.add(file_sec_doc)
        db.add_all(create_permissions(file_sec_doc.id))

        flag1 = ComplianceFlagModel(
            id="flag-101",
            file_id=file_sec_doc.id,
            line_or_section="Section 4.2 - Material Disclosures",
            severity="high",
            reason="Unredacted investor identity reference detected under SEC Rule 17a-4.",
            timestamp=now
        )
        flag2 = ComplianceFlagModel(
            id="flag-102",
            file_id=file_sec_doc.id,
            line_or_section="Schedule B - Liquidity Analysis",
            severity="medium",
            reason="Liquidity ratio difference of >2.5% vs preliminary quarterly draft.",
            timestamp=now
        )
        db.add_all([flag1, flag2])

        file_lp_agreement = FileModel(
            id="file-lp-302",
            name="Limited_Partner_Agreement_v4.md",
            parent_id=folder_legal.id,
            is_folder=False,
            size_bytes=14320,
            mime_type="text/markdown",
            file_extension=".md",
            sensitivity="Restricted",
            storage_key="file-lp-302-Limited_Partner_Agreement_v4.md",
            content_preview=(
                "# LIMITED PARTNERSHIP MASTER AGREEMENT\n\n"
                "## 1. Capital Commitments & Closings\n"
                "Each Limited Partner agrees to contribute capital upon capital call notice within 10 business days.\n\n"
                "## 8. Confidentiality & Non-Disclosure Covenants\n"
                "All financial statements, proprietary deal pipeline decks, and audit disclosures\n"
                "remain strictly restricted under Schedule C covenants.\n\n"
                "## 12. Indemnification Clause\n"
                "[CLAUSE 12.1 - FIDUCIARY INDEMNITY]\n"
                "The General Partner shall be indemnified against all non-willful fiduciary damages\n"
                "up to the maximum aggregated fund commitment threshold."
            ),
            created_at=now,
            updated_at=now
        )
        db.add(file_lp_agreement)
        db.add_all(create_permissions(file_lp_agreement.id))

        flag3 = ComplianceFlagModel(
            id="flag-103",
            file_id=file_lp_agreement.id,
            line_or_section="Clause 12.1 - Indemnification",
            severity="high",
            reason="Non-standard liability indemnity cap requires Senior Compliance sign-off.",
            timestamp=now
        )
        db.add(flag3)

        file_portfolio_json = FileModel(
            id="file-portfolio-303",
            name="portfolio_allocation_metrics.json",
            parent_id=folder_funds.id,
            is_folder=False,
            size_bytes=8940,
            mime_type="application/json",
            file_extension=".json",
            sensitivity="Internal Only",
            storage_key="file-portfolio-303-portfolio_allocation_metrics.json",
            content_preview=(
                "{\n"
                '  "portfolioId": "FUND-ALPHA-2026",\n'
                '  "totalAUM": 1250000000,\n'
                '  "currency": "USD",\n'
                '  "reportingQuarter": "2026-Q3",\n'
                '  "assetAllocation": {\n'
                '    "privateEquity": 0.45,\n'
                '    "ventureDebt": 0.25,\n'
                '    "realEstate": 0.20,\n'
                '    "treasuryBills": 0.10\n'
                "  },\n"
                '  "regulatoryComplianceStatus": "APPROVED",\n'
                '  "lastAuditedDate": "2026-08-15"\n'
                "}"
            ),
            created_at=now,
            updated_at=now
        )
        db.add(file_portfolio_json)
        db.add_all(create_permissions(file_portfolio_json.id))

        # Root Public Overview file
        file_overview = FileModel(
            id="file-overview-304",
            name="VDR_Governance_and_Compliance_Overview.txt",
            parent_id=None,
            is_folder=False,
            size_bytes=5200,
            mime_type="text/plain",
            file_extension=".txt",
            sensitivity="Public",
            storage_key="file-overview-304-overview.txt",
            content_preview=(
                "=== VIRTUAL DATA ROOM COMPLIANCE OVERVIEW ===\n\n"
                "System: Acumen VDR v1.0.0\n"
                "Security Architecture: Role-Based Access Control (RBAC)\n"
                "Storage Engine: MinIO S3 Object Store with AES-256 server-side encryption.\n"
                "Audit Logging: Continuous immutable event tracking for compliance certifications."
            ),
            created_at=now,
            updated_at=now
        )
        db.add(file_overview)
        db.add_all(create_permissions(file_overview.id))

        # 5. Seed Initial Audit Trail
        audit_events = [
            AuditLogModel(
                id=f"audit-{uuid.uuid4().hex[:8]}",
                file_id=folder_funds.id,
                file_name=folder_funds.name,
                action="Uploaded",
                actor_id="usr-admin-01",
                actor_name="Alexander Vance",
                actor_role="Admin",
                actor_avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                details="Provisioned root directory 'Fund Alpha - Portfolio Assets'",
                timestamp=now
            ),
            AuditLogModel(
                id=f"audit-{uuid.uuid4().hex[:8]}",
                file_id=file_sec_doc.id,
                file_name=file_sec_doc.name,
                action="Uploaded",
                actor_id="usr-comp-02",
                actor_name="Elena Rostova",
                actor_role="Compliance Officer",
                actor_avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                details="Uploaded SEC 10-K filing to /Fund Alpha - Portfolio Assets/2026-Q3 SEC Filings",
                timestamp=now
            ),
            AuditLogModel(
                id=f"audit-{uuid.uuid4().hex[:8]}",
                file_id=file_sec_doc.id,
                file_name=file_sec_doc.name,
                action="Flagged",
                actor_id="usr-comp-02",
                actor_name="Elena Rostova",
                actor_role="Compliance Officer",
                actor_avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                details="Marked Section 4.2 with High Severity Compliance Flag (SEC Rule 17a-4)",
                timestamp=now
            ),
            AuditLogModel(
                id=f"audit-{uuid.uuid4().hex[:8]}",
                file_id=file_lp_agreement.id,
                file_name=file_lp_agreement.name,
                action="Permission Changed",
                actor_id="usr-admin-01",
                actor_name="Alexander Vance",
                actor_role="Admin",
                actor_avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                details="Restricted edit access for Advisor role on Limited Partner Agreement",
                timestamp=now
            )
        ]
        db.add_all(audit_events)

        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
