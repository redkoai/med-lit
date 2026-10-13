# Expert benchmark protocol

MedLit does not claim expert validation until real reviews are collected. Use this folder to create auditable validation evidence.

1. Preselect a study sample across supported designs and source-coverage conditions.
2. Freeze the article source package, MedLit version, model, and rubric version.
3. Have at least two domain-qualified reviewers independently answer the same rubric questions while blinded to MedLit output.
4. Preserve both original reviews, expertise/role metadata, time spent, and any unable-to-assess decisions.
5. Adjudicate disagreements separately; do not overwrite original labels.
6. Export deidentified MedLit judgments and expert consensus into a copy of `expert-review-template.json`.
7. Run `npm run benchmark -- path/to/completed-review.json`.

To create reviewer packets from a private MedLit library backup without exposing the model judgments, run:

`npm run benchmark:prepare -- path/to/private-library-backup.json path/to/private-blinded-packets.json`

The generated packet contains the retrieved source text, its SHA-256 hash, source coverage, and rubric questions, but omits MedLit judgments and rationales. Keep that output outside the repository unless you have redistribution rights for every included article.

The benchmark command reports exact domain agreement with a 95% Wilson interval, agreement excluding non-determinate items, overcall and undercall rates, and design/coverage strata. Do not publish a single “accuracy” number without the sample, protocol, uncertainty, and disagreement policy.

Completed reviews may contain licensed article passages or reviewer identities; keep them outside the public repository unless publication rights and consent are explicit.
