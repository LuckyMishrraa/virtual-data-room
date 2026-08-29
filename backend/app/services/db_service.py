import uuid
from datetime import datetime

from app.models.schemas import (
    AuditLogResponse,
    ComplianceFlag,
    RolePermissions,
    UserRole,
    VDRFileResponse,
)

# Default Role Matrix template
DEFAULT_PERMISSIONS: dict[UserRole, RolePermissions] = {
    "Admin": RolePermissions(canView=True, canEdit=True, canShare=True),
    "Compliance Officer": RolePermissions(canView=True, canEdit=True, canShare=True),
    "Advisor": RolePermissions(canView=True, canEdit=False, canShare=False),
    "Auditor": RolePermissions(canView=True, canEdit=False, canShare=False),
}

class InMemoryDatabase:
    def __init__(self):
        self.files: dict[str, VDRFileResponse] = {}
        self.audit_logs: list[AuditLogResponse] = []
        self._seed_sample_data()

    def _seed_sample_data(self):
        now = datetime.utcnow().isoformat() + "Z"

        # Sample Folders
        f_funds_id = "folder-funds-101"
        f_disclosures_id = "folder-disc-202"

        self.files[f_funds_id] = VDRFileResponse(
            id=f_funds_id,
            name="Funds & Portfolio Assets",
            parentId=None,
            isFolder=True,
            sizeBytes=0,
            mimeType="inode/directory",
            fileExtension="",
            sensitivity="Internal Only",
            complianceFlags=[],
            permissions=DEFAULT_PERMISSIONS,
            createdAt=now,
            updatedAt=now,
        )

        self.files[f_disclosures_id] = VDRFileResponse(
            id=f_disclosures_id,
            name="2026-Q3 SEC Filings",
            parentId=f_funds_id,
            isFolder=True,
            sizeBytes=0,
            mimeType="inode/directory",
            fileExtension="",
            sensitivity="Confidential",
            complianceFlags=[],
            permissions=DEFAULT_PERMISSIONS,
            createdAt=now,
            updatedAt=now,
        )

        # Sample Files
        doc1_id = "file-sec-301"
        self.files[doc1_id] = VDRFileResponse(
            id=doc1_id,
            name="SEC_Form_10K_Annual_Report.txt",
            parentId=f_disclosures_id,
            isFolder=False,
            sizeBytes=24580,
            mimeType="text/plain",
            fileExtension=".txt",
            sensitivity="Confidential",
            complianceFlags=[
                ComplianceFlag(
                    id="flag-1",
                    lineOrSection="Section 4.2 - Material Disclosures",
                    severity="high",
                    reason="Unredacted investor identity reference detected under SEC Rule 17a-4.",
                    timestamp=now
                ),
                ComplianceFlag(
                    id="flag-2",
                    lineOrSection="Schedule B - Liquidity Analysis",
                    severity="medium",
                    reason="Liquidity ratio differs by >2.5% from quarterly disclosure summary.",
                    timestamp=now
                )
            ],
            permissions=DEFAULT_PERMISSIONS,
            createdAt=now,
            updatedAt=now,
            contentPreview="=== UNITED STATES SECURITIES AND EXCHANGE COMMISSION ===\nFORM 10-K ANNUAL FILING\nFiscal Year Ended December 31, 2025\n\n[CONFIDENTIAL FINANCIAL ASSET PORTFOLIO]\n\nSection 4.2 - Material Disclosures:\nThe Partnership engaged in structured derivatives hedging with Sovereign Fund Alpha.\nClient PII Flag: Individual beneficiary accounts withheld per confidentiality covenants.\n\nSchedule B - Liquidity Analysis:\nTotal Cash Equivalents: $450,200,000 USD\nTier 1 Capital Adequacy Ratio: 16.4%\nOperational Compliance Status: Full Audit Passed."
        )

        doc2_id = "file-lp-302"
        self.files[doc2_id] = VDRFileResponse(
            id=doc2_id,
            name="Limited_Partner_Agreement_v4.md",
            parentId=f_funds_id,
            isFolder=False,
            sizeBytes=14320,
            mimeType="text/markdown",
            fileExtension=".md",
            sensitivity="Restricted",
            complianceFlags=[
                ComplianceFlag(
                    id="flag-3",
                    lineOrSection="Clause 12.1 - Indemnification",
                    severity="high",
                    reason="Non-standard liability cap requires Senior Compliance sign-off.",
                    timestamp=now
                )
            ],
            permissions=DEFAULT_PERMISSIONS,
            createdAt=now,
            updatedAt=now,
            contentPreview="# LIMITED PARTNERSHIP MASTER AGREEMENT\n\n## 1. Capital Contributions\nEach Partner shall contribute the initial capital commitment as scheduled.\n\n## 12. Indemnification & Liability\nClause 12.1: The General Partner shall be indemnified against all non-willful fiduciary damages up to the maximum aggregated fund commitment threshold."
        )

        doc3_id = "file-portfolio-303"
        self.files[doc3_id] = VDRFileResponse(
            id=doc3_id,
            name="portfolio_allocation_metrics.json",
            parentId=None,
            isFolder=False,
            sizeBytes=8940,
            mimeType="application/json",
            fileExtension=".json",
            sensitivity="Internal Only",
            complianceFlags=[],
            permissions=DEFAULT_PERMISSIONS,
            createdAt=now,
            updatedAt=now,
            contentPreview='{\n  "portfolioId": "FUND-ALPHA-2026",\n  "totalAUM": 1250000000,\n  "currency": "USD",\n  "assetAllocation": {\n    "privateEquity": 0.45,\n    "ventureDebt": 0.25,\n    "realEstate": 0.20,\n    "treasuryBills": 0.10\n  },\n  "complianceVerified": true\n}'
        )

        # Seed Audit Logs
        self.audit_logs.append(
            AuditLogResponse(
                id=str(uuid.uuid4()),
                fileId=doc1_id,
                fileName="SEC_Form_10K_Annual_Report.txt",
                action="Uploaded",
                actor={"id": "usr-1", "name": "Elena Rostova", "role": "Compliance Officer", "avatarUrl": ""},
                details="Initial document ingestion into 2026-Q3 SEC Filings",
                timestamp=now
            )
        )
        self.audit_logs.append(
            AuditLogResponse(
                id=str(uuid.uuid4()),
                fileId=doc1_id,
                fileName="SEC_Form_10K_Annual_Report.txt",
                action="Flagged",
                actor={"id": "usr-1", "name": "Elena Rostova", "role": "Compliance Officer", "avatarUrl": ""},
                details="Tagged Section 4.2 with High Severity Compliance Flag (Rule 17a-4)",
                timestamp=now
            )
        )

db = InMemoryDatabase()
