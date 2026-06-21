"""
Data flow diagram for the EEP Next.js Template.

Shows the read path (blue) and write path (green) through the layer stack.
Kept intentionally minimal — the goal is to show the shape, not every detail.

Generates: data-flow.png

Run with:
    uv run python data-flow.py
"""

import os

from diagrams import Cluster, Diagram, Edge
from diagrams.custom import Custom
from diagrams.onprem.client import Users
from diagrams.onprem.container import Docker
from diagrams.programming.framework import NextJs

_here = os.path.dirname(os.path.abspath(__file__))


def icon(name: str) -> str:
    """Resolve a Material Icon Theme PNG by folder name."""
    return os.path.join(_here, "icons", "material-png", f"{name}.png")


graph_attr = {
    "fontsize": "16",
    "bgcolor": "white",
    "pad": "1.2",
    "splines": "ortho",
    "nodesep": "1.0",
    "ranksep": "1.4",
}

with Diagram(
    "EEP Next.js Template — Data Flow",
    filename="data-flow",
    show=False,
    direction="LR",
    graph_attr=graph_attr,
):
    browser = Users("Browser")

    with Cluster("Client Layer"):
        swr       = Custom("SWR Hook\nhooks/",        icon("folder-hook"))
        action_trigger = Custom("Component\ncomponents/", icon("folder-components"))

    with Cluster("API Layer"):
        route  = NextJs("Route Handler\napp/api/")
        action = Custom("Server Action\nactions/",    icon("folder-controller"))

    with Cluster("Server Layer"):
        service = Custom("Service\nclasses/services/", icon("folder-server"))

    with Cluster("Data"):
        db     = Custom("Neon\n(prod)",          icon("neon"))
        docker = Docker("docker-compose\n(local dev)")

    # ── Read path (blue) ────────────────────────────────────────
    browser       >> Edge(label="GET",              color="#3b82f6", fontcolor="#3b82f6") >> swr
    swr           >> Edge(label="fetch()",      color="#3b82f6", fontcolor="#3b82f6") >> route
    route         >> Edge(label="delegate",     color="#3b82f6", fontcolor="#3b82f6") >> service
    service       >> Edge(label="SELECT",       color="#3b82f6", fontcolor="#3b82f6") >> db
    db            >> Edge(label="response",     color="#3b82f6", fontcolor="#3b82f6") >> swr

    # ── Write path (green) ───────────────────────────────────────
    action_trigger >> Edge(label="POST / mutation", color="#16a34a", fontcolor="#16a34a") >> action
    action         >> Edge(label="delegate",    color="#16a34a", fontcolor="#16a34a") >> service
    service        >> Edge(label="INSERT/UPDATE", color="#16a34a", fontcolor="#16a34a") >> db
    action         >> Edge(label="revalidate",    color="#16a34a", fontcolor="#16a34a", style="dashed") >> swr


