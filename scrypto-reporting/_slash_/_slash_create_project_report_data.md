---

&nbsp; 🎯 REPORT GENERATION INSTRUCTIONS



&nbsp; You must generate reports in this EXACT 3-section format

&nbsp; for programmatic rendering.



&nbsp; 📝 Required Structure



&nbsp; # Report Title Here

&nbsp; ## Subtitle (optional)

&nbsp; Date: YYYY-MM-DD

&nbsp; Version: X.X



&nbsp; ## STATS

&nbsp; |stat-name="Total

&nbsp; Items";stat-type="count";stat-source="all"|

&nbsp; |stat-name="Completion Rate";stat-type="percentage";stat-s

&nbsp; ource="col-5,col-6";stat-condition="Yes,Complete"|

&nbsp; |stat-name="API Coverage";stat-type="pie";stat-source="col

&nbsp; -8";stat-condition="Yes,Partial,No"|



&nbsp; ## SUMMARY

&nbsp; Write a clear summary in plain text or HTML. Use \*\*bold\*\*

&nbsp; for emphasis.

&nbsp; Explain key findings, blockers, and next steps.



&nbsp; ## DATA

&nbsp; | Column1 | Column2 | Status | Progress |

&nbsp; | item1 | group1 | Yes@green | 95% |

&nbsp; | item2 | group2 | No@red | 0% |

&nbsp; | item3 | group3 | Partial@orange | 50% |



&nbsp; 🎨 Color Formatting Rules



&nbsp; Status Values:

&nbsp; - Yes@green → Green checkmark ✓

&nbsp; - No@red → Red X ✗

&nbsp; - Partial@orange → Orange text

&nbsp; - Complete@green → Green checkmark ✓

&nbsp; - Failed@red → Red X ✗

&nbsp; - In Progress@blue → Blue text

&nbsp; - N/A → Gray dash -



&nbsp; Custom Colors:

&nbsp; - Text@purple → Purple text

&nbsp; - Text#ff6b35 → Hex color text

&nbsp; - !(red) → Red exclamation mark



&nbsp; 📊 Stat Block Types



&nbsp; Count:

&nbsp; |stat-name="Total

&nbsp; Items";stat-type="count";stat-source="all"|



&nbsp; Percentage:

&nbsp; |stat-name="Completion %";stat-type="percentage";stat-sour

&nbsp; ce="col-5";stat-condition="Yes,Complete"|

&nbsp; - stat-source: Column numbers (col-1, col-2, etc.)

&nbsp; - stat-condition: Values that count as "complete"



&nbsp; Pie Chart:

&nbsp; |stat-name="Status Distribution";stat-type="pie";stat-sour

&nbsp; ce="col-3";stat-condition="Yes,Partial,No"|



&nbsp; 🚨 CRITICAL RULES



&nbsp; 1. Use exact section headers: ## STATS, ## SUMMARY, ##

&nbsp; DATA

&nbsp; 2. No extra text between sections

&nbsp; 3. Consistent column naming (no spaces in headers)

&nbsp; 4. Use @color codes for all status values

&nbsp; 5. N/A for not applicable fields

&nbsp; 6. One stat definition per line



&nbsp; ❌ Common Mistakes to Avoid



&nbsp; - Don't use complex descriptions in data cells

&nbsp; - Don't mix formatting styles

&nbsp; - Don't add extra headers or metadata

&nbsp; - Don't use spaces in column names

&nbsp; - Don't forget the | delimiters



&nbsp; ✅ Example Complete Report



&nbsp; # API Implementation Status

&nbsp; ## Development Progress Report

&nbsp; Date: 2025-08-31

&nbsp; Version: 2.1



&nbsp; ## STATS

&nbsp; |stat-name="Total

&nbsp; Endpoints";stat-type="count";stat-source="all"|

&nbsp; |stat-name="Tests Passing";stat-type="percentage";stat-sou

&nbsp; rce="col-4";stat-condition="Yes"|

&nbsp; |stat-name="Documentation";stat-type="percentage";stat-sou

&nbsp; rce="col-5";stat-condition="Complete"|



&nbsp; ## SUMMARY

&nbsp; API development is \*\*78% complete\*\* with core endpoints

&nbsp; functional.

&nbsp; Authentication and user management fully implemented.

&nbsp; \*\*Blocker:\*\* Payment gateway integration pending external

&nbsp; approval.



&nbsp; ## DATA

&nbsp; | Endpoint | Method | Status | Tests | Documentation |

&nbsp; | auth-login | POST | Yes@green | Yes@green |

&nbsp; Complete@green |

&nbsp; | auth-signup | POST | Yes@green | Yes@green |

&nbsp; Complete@green |

&nbsp; | user-profile | GET | Yes@green | No@red | Partial@orange

&nbsp;  |

&nbsp; | payments | POST | No@red | No@red | No@red |



&nbsp; ---

&nbsp; 🎯 Follow this format exactly for programmatic rendering.

&nbsp; The renderer expects this structure and will fail with any

&nbsp;  deviations.

