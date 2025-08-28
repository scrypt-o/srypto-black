\# MEDICAL\_APP\_PROTOCOL.config

\# BUGS = DEATH. This is not a metaphor.



class MedicalWorker:

&nbsp;   MODE = "ALWAYS\_PARANOID"

&nbsp;   CONTEXT = "FDA\_CLASS\_III"

&nbsp;   

&nbsp;   def on\_any\_task(self, task):

&nbsp;       # STEP 1: No spec = No code

&nbsp;       spec = find(f"ai/specs/{task.type}-spec.md")

&nbsp;       if not spec:

&nbsp;           if complex(task) or unclear(task):

&nbsp;               return ASK\_USER("Need spec for: " + task)

&nbsp;           else:

&nbsp;               spec = create\_spec(task)

&nbsp;       

&nbsp;       # STEP 2: Always create jobcard

&nbsp;       jobcard = create(f"ai/jobcards/{date}-{task.name}.md")

&nbsp;       jobcard.template = """

&nbsp;           SPEC: {spec\_path}

&nbsp;           STARTED: {timestamp}

&nbsp;           PLAN: 

&nbsp;           - \[ ] step\_1

&nbsp;           - \[ ] step\_2

&nbsp;           - \[ ] TEST\_ALL

&nbsp;           STATUS: working

&nbsp;           NOTES: 

&nbsp;       """

&nbsp;       register\_job(jobcard)

&nbsp;       

&nbsp;       # STEP 3: Work loop

&nbsp;       for step in jobcard.plan:

&nbsp;           code = implement(step)

&nbsp;           TEST\_IMMEDIATELY(code)  # MANDATORY

&nbsp;           if test.fails:

&nbsp;               FIX\_BEFORE\_CONTINUING()

&nbsp;           jobcard.tick(step)

&nbsp;           jobcard.update\_notes()

&nbsp;       

&nbsp;       # STEP 4: Close only if safe

&nbsp;       if all\_tests.passing:

&nbsp;           jobcard.status = "complete"

&nbsp;           move(jobcard, "ai/jobcards/submitted/")

&nbsp;       else:

&nbsp;           BLOCKED("Tests failing - cannot close")

&nbsp;   

&nbsp;   def on\_every\_change(self):

&nbsp;       UPDATE\_JOBCARD()

&nbsp;       RUN\_TESTS()

&nbsp;   

&nbsp;   def on\_context\_low(self):

&nbsp;       jobcard.add("""

&nbsp;           === HANDOVER ===

&nbsp;           STOPPED\_AT: {current\_line}

&nbsp;           NEXT\_STEP: {specific\_action}

&nbsp;           WARNINGS: {any\_issues}

&nbsp;       """)

&nbsp;       rename(jobcard, f"{jobcard}\_HANDOVER")

&nbsp;   

&nbsp;   def on\_session\_start(self):

&nbsp;       handovers = find("ai/jobcards/\*HANDOVER\*")

&nbsp;       if handovers:

&nbsp;           oldest = handovers.sort\_by\_date().first

&nbsp;           CONTINUE\_FROM(oldest.handover\_notes)



\# ENFORCEMENT

assert NO\_SPEC == NO\_CODE

assert NO\_TEST == ILLEGAL  

assert UNTESTED == PATIENT\_DEATH

assert ALWAYS\_UPDATE\_JOBCARD == TRUE



\# STANDING SPECS (check these first)

SPECS = {

&nbsp;   "supabase": "ai/specs/supabase-patterns-spec.md",  # Never direct reads

&nbsp;   "routing": "ai/specs/routing-spec.md",

&nbsp;   "naming": "ai/specs/naming-conventions-spec.md",

&nbsp;   "auth": "ai/specs/auth-spec.md"

}



\# PANIC BUTTONS

if unclear: ASK()

if broken: STOP()

if no\_test: REFUSE()

