#!/bin/bash

# SCRYPTO NAMING CONVENTION VALIDATOR
# Run this before EVERY commit to ensure consistency

echo "========================================="
echo "SCRYPTO NAMING CONVENTION VALIDATOR"
echo "========================================="

# Define the ONLY valid group names
VALID_GROUPS="comm persinfo presc medications location deals vitality carenet medhist labresults rewards"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo -e "\n${YELLOW}Checking API folder structure...${NC}"
echo "Valid groups: $VALID_GROUPS"
echo ""

# Check API folders
for folder in app/api/patient/*/; do
    if [ -d "$folder" ]; then
        basename_folder=$(basename "$folder")
        
        # Check if folder name is in valid groups
        if echo "$VALID_GROUPS" | grep -w -q "$basename_folder"; then
            echo -e "${GREEN}✓${NC} API folder: $basename_folder"
        else
            echo -e "${RED}✗${NC} INVALID API folder: $basename_folder"
            echo "  Must be one of: $VALID_GROUPS"
            ERRORS=$((ERRORS + 1))
            
            # Suggest correction
            case "$basename_folder" in
                "personal-info"|"personal_info")
                    echo "  → Should be: persinfo"
                    ;;
                "medical-history"|"medical_history")
                    echo "  → Should be: medhist"
                    ;;
                "care-network"|"care_network")
                    echo "  → Should be: carenet"
                    ;;
                "prescriptions")
                    echo "  → Should be: presc"
                    ;;
                "lab-results"|"lab_results")
                    echo "  → Should be: labresults"
                    ;;
                *)
                    echo "  → Not a valid patient group!"
                    ;;
            esac
        fi
    fi
done

echo -e "\n${YELLOW}Checking database tables...${NC}"

# Check if any tables exist with wrong naming
TABLES=$(ls migrations/*.sql 2>/dev/null | xargs grep -h "CREATE TABLE" | grep -o "patient__[a-z_]*" | sort -u)

for table in $TABLES; do
    # Extract group from table name (patient__GROUP__item)
    group=$(echo $table | cut -d'_' -f3)
    
    if echo "$VALID_GROUPS" | grep -w -q "$group"; then
        echo -e "${GREEN}✓${NC} Table group: $group (from $table)"
    else
        echo -e "${RED}✗${NC} INVALID table group: $group (from $table)"
        ERRORS=$((ERRORS + 1))
    fi
done

echo -e "\n${YELLOW}Checking page routes...${NC}"

# Check page routes
for folder in app/patient/*/; do
    if [ -d "$folder" ]; then
        basename_folder=$(basename "$folder")
        
        # Skip special folders
        if [[ "$basename_folder" == "settings" || "$basename_folder" == "(auth)" ]]; then
            continue
        fi
        
        if echo "$VALID_GROUPS" | grep -w -q "$basename_folder"; then
            echo -e "${GREEN}✓${NC} Page route: $basename_folder"
        else
            echo -e "${RED}✗${NC} INVALID page route: $basename_folder"
            ERRORS=$((ERRORS + 1))
        fi
    fi
done

echo -e "\n========================================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All naming conventions are correct!${NC}"
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS naming violations!${NC}"
    echo -e "${YELLOW}Fix these before committing to prevent app failures.${NC}"
    echo ""
    echo "Reference: ai/specs/core/CORE-NAMING-CONVENTION.md"
    exit 1
fi