# The image carries the artefact, never the source record.
#
# This Dockerfile deliberately does NOT run `next build`. The build happens on
# the machine that holds the Corpus (ADR-0002, ADR-0007): `content/` is gitignored
# and never reaches this context, so a build here would fail on the missing
# Identity — the guard working, not a bug to route around.
#
# It takes a single tarball rather than copying directories. `railway up` filters
# its upload through `.railwayignore` combined with `.gitignore`, and names inside
# the artefact (`content`, `node_modules`) collide with patterns that must exclude
# their root-level namesakes. A tarball is opaque to every one of those rules, so
# what arrives is exactly what `scripts/pack-deploy.mjs` packed.

FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

# Already laid out as /app: the standalone server at the root (with its traced
# node_modules and the baked Featured Corpus), plus .next/static and public.
ADD deploy.tar ./

# Fail loudly here rather than at the first chat request. A missing corpus would
# otherwise deploy an agent that answers "I don't have that recorded" to
# everything, with nothing in any log to say why.
RUN test -f server.js && test -d node_modules/next && test -d content/accomplishments

EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
