# ASSET MAP

| path | primary_function | axis_candidate | duplication_status | related_files | recommended_action | notes |
|------|------------------|----------------|-------------------|----------------|-------------------|-------|
| .env.example | Environment configuration | arc-shared | UNIQUE | shared/schema.ts | Move to arc-shared | Contains shared environment variables |
| .gitignore | Git ignore rules | arc-meta | UNIQUE | .vscode/, .firebase/, .idx/ | Move to arc-meta | Standard ignore patterns |
| ARC-Namer.zip | Project archive | arc-meta | DUPLICATE | Entire repository | Move to arc-meta | Exact duplicate of repo contents |
| ARC_FULL_MANIFEST_REPORT.md | System status report | arc-docs | UNIQUE | ARC_Report_v14.6.txt, docs/ | Move to arc-docs | Generated system overview |
| ARC_Report_v14.6.txt | System report | arc-docs | UNIQUE | ARC_FULL_MANIFEST_REPORT.md | Move to arc-docs | Text version of manifest report |
| Dockerfile | Container definition | arc-ops | UNIQUE | arc_deploy.sh, setup.sh | Move to arc-ops | Docker deployment config |
| GOOGLEAI.py | AI integration test | arc-core | UNIQUE | arc_reality_probe.js | Move to arc-core | Google AI connection test |
| LICENSE | Legal license | arc-meta | UNIQUE | README.md | Move to arc-meta | MIT license |
| README.md | Project documentation | arc-docs | PARTIAL | docs/, ARC_FULL_MANIFEST_REPORT.md | Move to arc-docs | Empty file, needs content |
| admin_build.sh | Build script | arc-ops | UNIQUE | script/build.ts, setup.sh | Move to arc-ops | Administrative build process |
| arc_bootstrap.js | System bootstrap | arc-ops | UNIQUE | arc_deploy.sh, setup.sh | Move to arc-ops | Initialization script |
| arc_core/ | Core brain logic | arc-core | UNIQUE | server/, shared/ | Move to arc-core | Main brain components |
| arc_core/actions/ | Action handlers | arc-core | UNIQUE | arc_core/workflows/ | Move to arc-core | Action definitions |
| arc_core/agent_contracts.json | Agent permissions | arc-core | UNIQUE | arc_core/brain_manifest.json | Move to arc-core | Contract definitions |
| arc_core/brain_loader.ts | Brain initialization | arc-core | UNIQUE | arc_core/brain_manifest.json | Move to arc-core | Loader component |
| arc_core/brain_manifest.json | System configuration | arc-core | UNIQUE | arc_core/agent_contracts.json | Move to arc-core | Manifest file |
| arc_core/workflows/ | Workflow definitions | arc-core | UNIQUE | arc_core/actions/ | Move to arc-core | Workflow logic |
| arc_deploy.sh | Deployment script | arc-ops | UNIQUE | Dockerfile, setup.sh | Move to arc-ops | Deployment automation |
| arc_e2e_verifier.js | End-to-end testing | arc-ops | UNIQUE | arc_reality_probe.js | Move to arc-ops | Testing framework |
| arc_e2e_verifier_*.json | Test results | arc-meta | DUPLICATE | arc_e2e_verifier.js | Move to arc-meta | Generated test outputs |
| arc_link_backend.js | Backend integration | arc-core | UNIQUE | server/ | Move to arc-core | Backend linking |
| arc_reality_probe.js | System probing | arc-ops | UNIQUE | arc_e2e_verifier.js | Move to arc-ops | Reality probe tool |
| arc_reality_probe_*.json | Probe results | arc-meta | DUPLICATE | arc_reality_probe.js | Move to arc-meta | Generated probe outputs |
| arc_replit_report.sh | Report generation | arc-ops | UNIQUE | ARC_FULL_MANIFEST_REPORT.md | Move to arc-ops | Report script |
| bash arc_deploy.sh | Deployment log/error | arc-meta | UNIQUE | arc_deploy.sh | Move to arc-meta | Possibly corrupted file |
| capacitor.config.ts | Mobile app config | arc-interface | UNIQUE | client/ | Move to arc-interface | Capacitor configuration |
| client/ | Frontend application | arc-interface | UNIQUE | capacitor.config.ts, archives/ui/📄 client/ | Move to arc-interface | React frontend |
| components.json | UI components config | arc-interface | UNIQUE | client/ | Move to arc-interface | Component library config |
| deploy-web.sh | Web deployment | arc-ops | UNIQUE | arc_deploy.sh | Move to arc-ops | Web deployment script |
| design_guidelines.md | Design documentation | arc-docs | UNIQUE | docs/ | Move to arc-docs | UI/UX guidelines |
| docs/ | Documentation directory | arc-docs | UNIQUE | ARC_FULL_MANIFEST_REPORT.md | Move to arc-docs | Main docs folder |
| docs/agents/ | Agent documentation | arc-docs | UNIQUE | docs/ | Move to arc-docs | Agent-specific docs |
| docs/agents/mrf_resume.json | Agent resume | arc-docs | UNIQUE | arc_core/agent_contracts.json | Move to arc-docs | Agent profile |
| docs/esp32-firmware-prompt.md | Firmware documentation | arc-docs | UNIQUE | firmware/ | Move to arc-docs | ESP32 firmware guide |
| docs/x-bio-sentinel-spec.md | Bio sentinel spec | arc-docs | UNIQUE | firmware/ | Move to arc-docs | Hardware spec |
| drizzle.config.ts | Database config | arc-shared | UNIQUE | shared/schema.ts | Move to arc-shared | Drizzle ORM config |
| firebase-debug.log | Debug log | arc-meta | UNIQUE | firebase.json | Move to arc-meta | Firebase debug output |
| firebase.json | Firebase config | arc-ops | UNIQUE | firebase-debug.log | Move to arc-ops | Firebase hosting config |
| firmware/ | ESP32 firmware | arc-firmware | UNIQUE | docs/esp32-firmware-prompt.md | Move to arc-firmware | Embedded code |
| firmware/.gitignore | Firmware ignore | arc-meta | DUPLICATE | .gitignore | Move to arc-meta | Firmware-specific ignore |
| firmware/README.md | Firmware docs | arc-docs | OVERLAPPING | docs/esp32-firmware-prompt.md | Move to arc-docs | Firmware README |
| firmware/include/ | Firmware includes | arc-firmware | UNIQUE | firmware/src/ | Move to arc-firmware | Header files |
| firmware/platformio.ini | PlatformIO config | arc-firmware | UNIQUE | firmware/ | Move to arc-firmware | Build config |
| firmware/src/ | Firmware source | arc-firmware | UNIQUE | firmware/include/ | Move to arc-firmware | Source code |
| main.py | Python script | arc-meta | UNIQUE | GOOGLEAI.py | Move to arc-meta | Simple test script |
| npm install ws | Install log | arc-meta | UNIQUE | package.json | Move to arc-meta | NPM install output |
| package-lock.json | Dependency lock | arc-meta | UNIQUE | package.json | Move to arc-meta | NPM lock file |
| package.json | Dependencies | arc-meta | UNIQUE | package-lock.json | Move to arc-meta | NPM package config |
| postcss.config.js | CSS processing | arc-interface | UNIQUE | tailwind.config.ts | Move to arc-interface | PostCSS config |
| pyproject.toml | Python config | arc-meta | UNIQUE | uv.lock | Move to arc-meta | Python dependencies |
| script/ | Build scripts | arc-ops | UNIQUE | admin_build.sh | Move to arc-ops | Script directory |
| script/build.ts | Build script | arc-ops | UNIQUE | admin_build.sh | Move to arc-ops | TypeScript build |
| server/ | Backend server | arc-core | UNIQUE | arc_core/, shared/ | Move to arc-core | Express server |
| server.log | Server log | arc-meta | UNIQUE | server/ | Move to arc-meta | Server output log |
| setup.sh | Setup script | arc-ops | UNIQUE | arc_deploy.sh | Move to arc-ops | System setup |
| shared/ | Shared utilities | arc-shared | UNIQUE | server/, client/ | Move to arc-shared | Shared code |
| shared/schema.ts | Database schemas | arc-shared | UNIQUE | drizzle.config.ts | Move to arc-shared | Schema definitions |
| supabase_arc_jobs_setup.sql | DB setup | arc-ops | UNIQUE | supabase_arc_jobs_test.sql | Move to arc-ops | Supabase setup |
| supabase_arc_jobs_test.sql | DB test | arc-ops | UNIQUE | supabase_arc_jobs_setup.sql | Move to arc-ops | Supabase test |
| tailwind.config.ts | CSS framework config | arc-interface | UNIQUE | postcss.config.js | Move to arc-interface | Tailwind config |
| tsconfig.json | TypeScript config | arc-meta | UNIQUE | package.json | Move to arc-meta | TS configuration |
| uv.lock | Python lock | arc-meta | UNIQUE | pyproject.toml | Move to arc-meta | Python lock file |
| vite.config.ts | Build tool config | arc-interface | UNIQUE | client/ | Move to arc-interface | Vite configuration |
| archives/ui/📄 client/ | Archived alternate client | arc-interface | OVERLAPPING | client/ | Move to arc-interface | Archived snapshot of alternate/duplicate frontend |
| .firebase/ | Firebase config | arc-meta | UNIQUE | firebase.json | Move to arc-meta | Firebase directory |
| .idx/ | IDX config | arc-meta | UNIQUE |  | Move to arc-meta | Development config |
| .vscode/ | VS Code config | arc-meta | UNIQUE |  | Move to arc-meta | IDE config |
