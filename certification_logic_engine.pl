% ---------------------- Certification Requirements ----------------------

% Type Certification Process (14 CFR Part 21)
type_certification(Aircraft) :-
    design_approved(Aircraft),
    safety_compliant(Aircraft),
    performance_tests_passed(Aircraft).

% Production Certification Process (14 CFR Part 21, Subpart G)
production_certification(Aircraft) :-
    production_certificate_valid(Aircraft),
    conforms_to_approved_design(Aircraft).

% Airworthiness Certification Process (14 CFR Part 21, Subpart H)
airworthiness_certification(Aircraft) :-
    holds_type_certificate(Aircraft),
    deemed_safe_for_operation(Aircraft),
    adheres_to_airworthiness_directives(Aircraft).

% Structural Integrity Assessment
structural_integrity(Aircraft) :-
    load_tests_passed(Aircraft),
    fatigue_analysis_completed(Aircraft),
    corrosion_protection_verified(Aircraft).

% Operational Safety Assessment
operational_safety(Aircraft) :-
    emergency_systems_operational(Aircraft),
    fail_safe_mechanisms_validated(Aircraft).

% Emergency Procedures Verification
emergency_procedures(Aircraft) :-
    emergency_exits_functional(Aircraft),
    evacuation_procedures_tested(Aircraft).

% System Reliability Assessment
system_reliability(Aircraft) :-
    redundancy_checks_passed(Aircraft),
    hazard_risk_assessment_complete(Aircraft).

% ---------------------- Certification Verification ----------------------

certification_approved(Aircraft) :-
    type_certification(Aircraft),
    production_certification(Aircraft),
    airworthiness_certification(Aircraft),
    structural_integrity(Aircraft),
    operational_safety(Aircraft),
    emergency_procedures(Aircraft),
    system_reliability(Aircraft),
    write(Aircraft), write(' has been certified successfully.'), nl.

% Certification failure if any requirement is not met
certification_approved(Aircraft) :-
    write(Aircraft), write(' certification FAILED due to missing requirements.'), nl, fail.

% ---------------------- Example Data (Certified Aircraft: Boeing 737) ----------------------

design_approved(boeing737).
safety_compliant(boeing737).
performance_tests_passed(boeing737).
production_certificate_valid(boeing737).
conforms_to_approved_design(boeing737).
holds_type_certificate(boeing737).
deemed_safe_for_operation(boeing737).
adheres_to_airworthiness_directives(boeing737).
load_tests_passed(boeing737).
fatigue_analysis_completed(boeing737).
corrosion_protection_verified(boeing737).
emergency_systems_operational(boeing737).
fail_safe_mechanisms_validated(boeing737).
emergency_exits_functional(boeing737).
evacuation_procedures_tested(boeing737).
redundancy_checks_passed(boeing737).
hazard_risk_assessment_complete(boeing737).

% ---------------------- Query Examples ----------------------

% Query to check if Boeing 737 meets all certification criteria:
% ?- certification_approved(boeing737).
% Expected Output: "boeing737 has been certified successfully."

% Query to check an aircraft not in the knowledge base:
% ?- certification_approved(boeing717).
% Expected Output: "boeing717 certification FAILED due to missing requirements."