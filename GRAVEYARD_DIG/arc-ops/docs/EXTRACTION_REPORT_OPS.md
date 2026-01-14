# EXTRACTION REPORT — OPS axis

- Source repository: firas103103-oss/mrf103ARC-Namer (repo id: 1126273170)
- Target repository: firas103103-oss/arc-ops
- Extraction date: 2026-01-01
- Target axis: OPS

Summary
-------

No files were extracted. I searched the source repository for files where the metadata fields satisfy:
- axis_candidate = OPS
- recommended_action = adopt

Searches performed
------------------
- Searched code for the token `axis_candidate` and reviewed docs/ASSET_MAP.md which lists asset metadata. https://github.com/firas103103-oss/mrf103ARC-Namer/blob/44dac5bee90fe4374fd69e7a568c16d63ea237b4/docs/ASSET_MAP.md
- Searched code for the token `recommended_action` and reviewed docs/x-bio-sentinel-spec.md for occurrences.

Note: Search results may be incomplete (limited to the first page of results). To view more results in the GitHub UI, see:
- https://github.com/firas103103-oss/mrf103ARC-Namer/search?q=axis_candidate&type=code
- https://github.com/firas103103-oss/mrf103ARC-Namer/search?q=recommended_action&type=code

Files considered but NOT extracted
---------------------------------
These files in the source repository have axis_candidate set to `arc-ops` (i.e., OPS) in docs/ASSET_MAP.md but their recommended_action is NOT `adopt` (they indicate "Move to arc-ops"). Per the extraction RULES they must not be copied.

- Dockerfile (path: Dockerfile) — recommended_action: Move to arc-ops
- admin_build.sh (path: admin_build.sh) — recommended_action: Move to arc-ops
- arc_bootstrap.js (path: arc_bootstrap.js) — recommended_action: Move to arc-ops
- arc_deploy.sh (path: arc_deploy.sh) — recommended_action: Move to arc-ops
- arc_e2e_verifier.js (path: arc_e2e_verifier.js) — recommended_action: Move to arc-ops
- arc_reality_probe.js (path: arc_reality_probe.js) — recommended_action: Move to arc-ops

Action taken
------------
- No files met both criteria (axis_candidate = OPS and recommended_action = adopt).
- No files were copied.
- No conflicts occurred.

Next steps / recommendations
---------------------------
- If you intended to extract files whose recommended action is "Move to arc-ops", clarify and I can re-run the extraction using that criterion.
- If there are other source metadata files (YAML/JSON) that might contain `axis_candidate`/`recommended_action`, provide their paths or grant permission to run a broader search.

Extraction log
--------------
- Performed repository code searches for `axis_candidate` and `recommended_action` and inspected matching files.
- All decisions follow the provided RULES: only copy files with axis_candidate = OPS and recommended_action = adopt.

Report produced by: ARC AXIS EXTRACTOR (STRICT FAST MODE)
