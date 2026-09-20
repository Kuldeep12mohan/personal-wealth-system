#!/usr/bin/env python3
"""
SpecKit token/usage report generator.

Parses Claude Code session transcripts (JSONL files under
~/.claude/projects/<project-slug>/) and produces a per-stage token
consumption and activity report for a SpecKit-driven project.

Usage:
    python token_report.py [--project-dir PATH] [--out report.md]

If --project-dir is omitted, it is derived from the current working
directory using Claude Code's slug convention (drive-letter colon and
path separators replaced with '-').

Stages are inferred from the most recently invoked SpecKit slash
command (a "<command-name>/speckit-...</command-name>" marker in a
user turn). Turns before the first recognized command are bucketed
under "Unattributed" and excluded from the printed table (but counted
in the raw totals row).
"""
import argparse
import glob
import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime, timezone

STAGE_COMMANDS = {
    "speckit-specify": "Specification",
    "speckit-constitution": "Specification",
    "speckit-clarify": "Clarification",
    "speckit-plan": "Planning",
    "speckit-tasks": "Planning",
    "speckit-checklist": "Planning",
    "speckit-taskstoissues": "Planning",
    "speckit-implement": "Implementation",
    "speckit-converge": "Implementation",
    "speckit-analyze": "Testing",
    "speckit-bug-test": "Testing",
    "speckit-bug-assess": "Change Request",
    "speckit-bug-fix": "Change Request",
}

STAGE_ORDER = [
    "Specification",
    "Clarification",
    "Planning",
    "Implementation",
    "Testing",
    "Change Request",
]

COMMAND_RE = re.compile(r"<command-name>/([a-zA-Z0-9._-]+)</command-name>")
SKILL_BODY_PREFIX = "Base directory for this skill:"


def default_project_dir():
    cwd = os.getcwd()
    slug = re.sub(r"[\\/:]", "-", cwd)
    slug = re.sub(r"[^A-Za-z0-9._-]", "-", slug)
    home = os.path.expanduser("~")
    return os.path.join(home, ".claude", "projects", slug)


def iter_session_files(project_dir):
    return sorted(glob.glob(os.path.join(project_dir, "*.jsonl")))


def parse_ts(ts):
    if not ts:
        return None
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except ValueError:
        return None


def extract_user_text_command(content):
    """Return the speckit command slug (without leading 'speckit-') if this
    user turn is a slash-command invocation, else None."""
    if isinstance(content, str):
        m = COMMAND_RE.search(content)
        if m:
            return m.group(1)
        return None
    if isinstance(content, list):
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                m = COMMAND_RE.search(block.get("text", ""))
                if m:
                    return m.group(1)
    return None


def is_real_user_interaction(content):
    """True if this user turn represents an actual user-authored event
    (typed message, interruption) rather than a tool-result echo or the
    auto-injected skill body that immediately follows a command."""
    if isinstance(content, str):
        return True
    if isinstance(content, list):
        if not content:
            return False
        if all(isinstance(b, dict) and b.get("type") == "tool_result" for b in content):
            return False
        first = content[0]
        if (
            isinstance(first, dict)
            and first.get("type") == "text"
            and first.get("text", "").startswith(SKILL_BODY_PREFIX)
        ):
            return False
        return True
    return False


def stage_for_command(cmd):
    base = cmd.split(" ")[0]
    return STAGE_COMMANDS.get(base)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--project-dir", default=None, help="Path to ~/.claude/projects/<slug>")
    ap.add_argument("--out", default=None, help="Write markdown report to this file (default: stdout)")
    args = ap.parse_args()

    project_dir = args.project_dir or default_project_dir()
    if not os.path.isdir(project_dir):
        print(f"error: project dir not found: {project_dir}", file=sys.stderr)
        sys.exit(1)

    files = iter_session_files(project_dir)
    if not files:
        print(f"error: no *.jsonl session files found in {project_dir}", file=sys.stderr)
        sys.exit(1)

    tokens_in = defaultdict(int)
    tokens_out = defaultdict(int)
    interactions = defaultdict(int)
    manual_corrections = defaultdict(int)
    command_invocations = defaultdict(int)
    artifacts = defaultdict(set)
    last_context_size = defaultdict(int)
    stage_seconds = defaultdict(float)

    total_lines = 0
    total_sessions = 0

    for path in files:
        total_sessions += 1
        current_stage = None
        run_start_ts = None
        last_ts = None

        def close_run(end_ts):
            if current_stage and run_start_ts and end_ts:
                stage_seconds[current_stage] += (end_ts - run_start_ts).total_seconds()

        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    d = json.loads(line)
                except json.JSONDecodeError:
                    continue
                total_lines += 1
                ts = parse_ts(d.get("timestamp"))
                if ts:
                    last_ts = ts

                if d.get("type") == "user":
                    content = d.get("message", {}).get("content")
                    cmd = extract_user_text_command(content)
                    if cmd:
                        stage = stage_for_command(cmd)
                        if stage:
                            close_run(ts)
                            current_stage = stage
                            run_start_ts = ts
                            command_invocations[stage] += 1
                            interactions[stage] += 1
                        continue
                    if is_real_user_interaction(content) and current_stage:
                        interactions[current_stage] += 1
                        manual_corrections[current_stage] += 1

                elif d.get("type") == "assistant":
                    msg = d.get("message", {})
                    usage = msg.get("usage") or {}
                    if current_stage and usage:
                        tokens_in[current_stage] += (
                            usage.get("input_tokens", 0)
                            + usage.get("cache_creation_input_tokens", 0)
                            + usage.get("cache_read_input_tokens", 0)
                        )
                        tokens_out[current_stage] += usage.get("output_tokens", 0)
                        ctx = usage.get("cache_read_input_tokens", 0) + usage.get(
                            "cache_creation_input_tokens", 0
                        )
                        if ctx:
                            last_context_size[current_stage] = ctx

                    if current_stage:
                        content = msg.get("content")
                        if isinstance(content, list):
                            for block in content:
                                if (
                                    isinstance(block, dict)
                                    and block.get("type") == "tool_use"
                                    and block.get("name") in ("Write", "Edit")
                                ):
                                    fp = (block.get("input") or {}).get("file_path")
                                    if fp:
                                        artifacts[current_stage].add(fp)

        close_run(last_ts)

    # ---- render report ----
    lines = []
    lines.append("# SpecKit Token & Activity Report")
    lines.append("")
    lines.append(f"- Project dir: `{project_dir}`")
    lines.append(f"- Sessions scanned: {total_sessions}")
    lines.append(f"- Generated: {datetime.now(timezone.utc).isoformat()}")
    lines.append("")
    lines.append("## Token Consumption by Stage")
    lines.append("")
    lines.append("| Stage | Input Tokens | Output Tokens | Total |")
    lines.append("|---|---:|---:|---:|")
    grand_in = grand_out = 0
    for stage in STAGE_ORDER:
        i, o = tokens_in.get(stage, 0), tokens_out.get(stage, 0)
        grand_in += i
        grand_out += o
        lines.append(f"| {stage} | {i:,} | {o:,} | {i + o:,} |")
    lines.append(f"| **Total** | **{grand_in:,}** | **{grand_out:,}** | **{grand_in + grand_out:,}** |")
    lines.append("")

    lines.append("## Additional Metrics by Stage")
    lines.append("")
    lines.append(
        "| Stage | Interactions | Artifacts | Context Size (last, tokens) | Time (min) | Command Invocations | Manual Corrections |"
    )
    lines.append("|---|---:|---:|---:|---:|---:|---:|")
    for stage in STAGE_ORDER:
        lines.append(
            "| {stage} | {inter} | {art} | {ctx:,} | {mins:.1f} | {iters} | {corr} |".format(
                stage=stage,
                inter=interactions.get(stage, 0),
                art=len(artifacts.get(stage, set())),
                ctx=last_context_size.get(stage, 0),
                mins=stage_seconds.get(stage, 0.0) / 60.0,
                iters=command_invocations.get(stage, 0),
                corr=manual_corrections.get(stage, 0),
            )
        )
    lines.append("")
    lines.append(
        "Notes: 'Command Invocations' under Implementation doubles as "
        "'Number of implementation iterations'. 'Manual Corrections' counts "
        "free-text user turns sent while a stage was active (i.e. the user "
        "redirected or corrected an in-flight command) — review these "
        "manually, this is a heuristic, not a semantic judgment of what was "
        "corrected. 'Context Size' is the cache tokens (read+creation) on "
        "the last model call attributed to that stage, i.e. the effective "
        "context window size at the end of the stage."
    )

    out = "\n".join(lines) + "\n"
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(out)
        print(f"wrote {args.out}")
    else:
        print(out)


if __name__ == "__main__":
    main()
