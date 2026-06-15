FROM mcr.microsoft.com/devcontainers/base:debian

# Install Postgres 17 as root during image build — avoids sudo password issues
# that occur when installing via postCreateCommand as the vscode user.
RUN apt-get update -qq \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq gnupg curl lsb-release \
  && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
     | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg \
  && echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
     > /etc/apt/sources.list.d/pgdg.list \
  && apt-get update -qq \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql-17 \
  # Graphviz for diagrams/
  && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq graphviz \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Configure Postgres: set password and create app database
RUN service postgresql start \
  && su -c "psql -c \"ALTER USER postgres WITH PASSWORD 'postgres';\"" postgres \
  && su -c "psql -c \"CREATE DATABASE app;\"" postgres \
  && service postgresql stop

# Allow vscode user to start/stop Postgres without a password.
# pg_ctlcluster and service postgresql are the only commands needed.
RUN echo "vscode ALL=(postgres) NOPASSWD: ALL" >> /etc/sudoers.d/vscode-postgres \
  && echo "vscode ALL=(root) NOPASSWD: /usr/sbin/service postgresql *" >> /etc/sudoers.d/vscode-postgres \
  && chmod 0440 /etc/sudoers.d/vscode-postgres
