"""
Deployment diagram for the EEP Next.js Template.

Shows the full production stack: Cloudflare (domain + DNS) → Vercel (hosting)
→ Neon (database) → Clerk (auth), plus the GitHub → Vercel CI/CD link.

Generates: deployment.png

Run with:
    uv run python deployment.py
"""

import os

from diagrams import Cluster, Diagram, Edge
from diagrams.custom import Custom
from diagrams.onprem.client import Users
from diagrams.onprem.vcs import Github
from diagrams.programming.framework import Vercel
from diagrams.saas.cdn import Cloudflare

_here = os.path.dirname(os.path.abspath(__file__))


def icon(name: str) -> str:
    """Resolve a Material Icon Theme PNG by folder name."""
    return os.path.join(_here, "icons", "material-png", f"{name}.png")


graph_attr = {
    "fontsize": "15",
    "bgcolor": "white",
    "pad": "1.2",
    "splines": "ortho",
    "nodesep": "0.8",
    "ranksep": "1.2",
}

with Diagram(
    "EEP Next.js Template — Deployment",
    filename="deployment",
    show=False,
    direction="LR",
    graph_attr=graph_attr,
):
    browser = Users("Browser")
    github  = Github("GitHub\nmain branch")

    # ── Cloudflare: domain registrar + DNS authority ──────────────
    with Cluster("Cloudflare  (registrar + DNS)"):
        cf_dns = Cloudflare("yourproject.dev\nDNS records\n(grey cloud — proxy OFF)")

    # ── Vercel: two projects, one repo ────────────────────────────
    with Cluster("Vercel  (hosting)"):
        vercel_app  = Vercel("App\nyourproject.dev")
        vercel_docs = Vercel("Docs\ndocs.yourproject.dev")

    # ── Clerk: auth SaaS ──────────────────────────────────────────
    with Cluster("Clerk  (auth)"):
        clerk = Custom("Production instance\naccounts / clerk\nsubdomains", icon("clerk"))

    # ─────────────────────────────────────────────────────────────
    # CI/CD: push to main triggers deploy on both Vercel projects
    # ─────────────────────────────────────────────────────────────
    github >> Edge(label="push to main\nauto-deploy", color="#6366f1", fontcolor="#6366f1") >> vercel_app
    github >> Edge(label="push to main\nauto-deploy", color="#6366f1", fontcolor="#6366f1") >> vercel_docs

    # ─────────────────────────────────────────────────────────────
    # DNS routing: Cloudflare is the authority for all records
    #
    # Vercel records (proxy OFF — grey cloud):
    #   A     @                → Vercel IP        (apex)
    #   CNAME www              → cname.vercel-dns.com
    #   CNAME docs             → cname.vercel-dns.com
    #
    # Clerk records (proxy OFF — grey cloud):
    #   CNAME accounts         → accounts.clerk.services
    #   CNAME clerk            → frontend-api.clerk.services
    #   CNAME clk._domainkey   → (Clerk-provided)   DKIM signing
    #   CNAME clk2._domainkey  → (Clerk-provided)   DKIM signing
    #   CNAME clkmail          → (Clerk-provided)   email sending
    # ─────────────────────────────────────────────────────────────
    browser >> Edge(label="yourproject.dev\ndocs.yourproject.dev") >> cf_dns

    cf_dns >> Edge(
        label="A @ → Vercel IP\nCNAME www → cname.vercel-dns.com",
        color="#0ea5e9",
        fontcolor="#0ea5e9",
    ) >> vercel_app

    cf_dns >> Edge(
        label="CNAME docs → cname.vercel-dns.com",
        color="#0ea5e9",
        fontcolor="#0ea5e9",
    ) >> vercel_docs

    cf_dns >> Edge(
        label="5 CNAMEs (proxy OFF)\naccounts → accounts.clerk.services\nclerk → frontend-api.clerk.services\nclk._domainkey, clk2._domainkey, clkmail",
        color="#f59e0b",
        fontcolor="#f59e0b",
        style="dashed",
    ) >> clerk

    # ─────────────────────────────────────────────────────────────
    # App ↔ services
    # ─────────────────────────────────────────────────────────────

    # App delegates auth to Clerk; Clerk returns JWT claims
    vercel_app >> Edge(
        label="auth requests\n(via clerk CNAME)",
        color="#f59e0b",
        fontcolor="#f59e0b",
        style="dashed",
    ) >> clerk

    clerk >> Edge(
        label="JWT session claims\n(sk_live_ / pk_live_)",
        color="#f59e0b",
        fontcolor="#f59e0b",
        style="dashed",
    ) >> vercel_app
