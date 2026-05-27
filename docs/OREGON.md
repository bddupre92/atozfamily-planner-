# Oregon Homeschool Compliance

Oregon is one of the lightest-regulation homeschool states in the country. This doc captures what's legally required of you and how `atozfamily-planner` helps you meet (and exceed) it.

## What Oregon legally requires

Under **ORS 339.030 / 339.035** and **OAR 581-021-0026**, Oregon homeschool families must do exactly two things:

### 1. Notify your local ESD — ONCE

- File a **Notice of Intent (NOI)** with your local Education Service District in writing
- **Within 10 days** of beginning home education
- Submit again only if you move to a different ESD's territory
- **No annual paperwork required**
- The ESD has 90 days to acknowledge receipt — keep their confirmation letter

**Your ESD (Hillsboro, Washington County)**:
→ **Northwest Regional ESD (NWRESD)**
→ Online notification: https://www.nwresd.org/services-and-programs/home-school-notification

**What goes in the NOI**:
- Parent name & address
- Each child's full legal name and date of birth
- Last school attended (or "never attended" + your school district name)

### 2. Standardized testing at specific grade levels

- Tests required at the **end of grades 3, 5, 8, and 10**
- Must be administered by **August 15** following the end of that grade year
- **18-month grace period** for first test after starting homeschool
- Must achieve **15th percentile or higher** composite score
- If below 15th percentile → re-test within 1 year; continued decline → ESD can require certified teacher supervision

**Approved tests**:
- Iowa Tests of Basic Skills (ITBS)
- Stanford Achievement Test (SAT-10) — *not the college SAT*
- TerraNova / CAT 3

**Qualified proctor required**: must be a "neutral non-family person." Co-op coordinators, credentialed tutors, and homeschool testing services qualify. Parents and grandparents do NOT.

**Typical cost**: $57–$85 for group testing through a co-op.

## What Oregon does NOT require

- ❌ Specific subjects
- ❌ Specific curriculum
- ❌ Instructional hours
- ❌ Attendance records
- ❌ Lesson plans
- ❌ Portfolio reviews
- ❌ Teacher certification or degree
- ❌ Approval process (NOIs cannot be denied)
- ❌ Annual re-registration

## Testing timeline for the Whitford kids

Assuming standard grade progression:

| Child | Current grade | First required test | Notes |
|-------|--------------|---------------------|-------|
| Eldest (age 7) | 2nd grade | By Aug 15, 2027 (after 3rd grade) | First test will be ITBS or similar. ~Summer 2027. |
| Middle (age 4–5) | Pre-K / K | By Aug 15, 2031 (after 3rd grade) | ~Summer 2031 |
| Youngest (age 2) | Tot | By Aug 15, 2033 (after 3rd grade) | ~Summer 2033 |

After 3rd grade, subsequent tests are end of grades 5, 8, and 10.

## How this app supports compliance

### Lesson tracking → de facto portfolio

Every lesson logged in the **Lessons tab** creates a defensible record: child, date, subject, curriculum, lesson reference, optional notes. Oregon doesn't require this, but if you ever face a low-percentile re-test situation or apply for public-school re-entry / scholarships, you have receipts.

### TestRecord model → testing log

The schema includes a `TestRecord` model for capturing each required standardized test:
- Test date, type (ITBS / SAT-10 / TerraNova), grade level
- Proctor name and contact (proof of qualified neutral proctor)
- Composite score percentile
- `passedThreshold` boolean (≥ 15th percentile)
- Score report PDF link (Phase 2, via Vercel Blob)

There's no admin UI yet to enter these — when Eldest takes her first test in 2027, I'll add a TestRecord form. Until then, the model is in place.

### Audit log → trust + documentation

Every change is timestamped and attributed to the editing parent. Combined with lesson records, this is more documentation than any homeschool family in Oregon needs — bordering on overkill, but you've built compliance work-products in pharma and you know the value of "I have receipts."

## Practical compliance checklist for you right now

- [ ] **Have you filed your NOI with NWRESD?** If you started homeschooling already, this should have been done within 10 days. If not, file ASAP — there's no penalty for late filing as long as you file. https://www.nwresd.org/services-and-programs/home-school-notification
- [ ] **Save the NWRESD confirmation letter** as a PDF in your records (Google Drive, this app's Phase 2 photo upload, etc.)
- [ ] **Calendar reminder** for Eldest's first standardized test by August 15, 2027
- [ ] **Find a local testing proctor** — many homeschool co-ops in Portland metro offer group testing. Plan ~6 months ahead.
- [ ] **Subscribe to NWRESD homeschool updates** — rare but they occasionally send notices

## Why exceed the minimum?

Oregon's low bar is a feature for families practicing freedom-oriented homeschooling. But there are real reasons to keep more thorough records than the state requires:

1. **Re-entry safety net**: if you ever need to put a kid in public school mid-year, a thorough record makes placement testing and grade assignment far smoother
2. **College & scholarship applications**: especially for Oregon Promise Grant and similar, you'll want clean transcripts and proof of coursework
3. **15th percentile defense**: if a test comes back below threshold, having a year's worth of lessons logged demonstrates you weren't neglecting instruction
4. **Co-op enrollment**: some Portland-area homeschool co-ops want to see what you've covered before admitting kids
5. **Your own feedback loop**: you can't improve what you don't measure — your OE training instinct

This app captures it as a byproduct of operating it. No extra work.

## Resources

- **Oregon Department of Education — Home Schooling**: https://www.oregon.gov/ode/students-and-family/parent-resources/Pages/Home-Schooling.aspx
- **NWRESD Home School page**: https://www.nwresd.org/services-and-programs/home-school-notification
- **HSLDA Oregon** (legal defense association): https://hslda.org/legal/oregon
- **ORS 339.030** (full text): https://oregon.public.law/statutes/ors_339.030
- **OAR 581-021-0026** (administrative rule): https://secure.sos.state.or.us/oard/viewSingleRule.action?ruleVrsnRsn=313007

---

*This document is for planning purposes only and is not legal advice. For specific legal questions, consult an attorney or HSLDA.*
