
  select 'clinic', (select count(*) from universal.clinic) union all
  select 'patient', (select count(*) from universal.patient) union all
  select 'practitioner', (select count(*) from universal.practitioner) union all
  select 'patient_practitioner', (select count(*) from universal.patient_practitioner) union all
  select 'entry', (select count(*) from universal.entry) union all
  select 'entry_attribute', (select count(*) from universal.entry_attribute) union all
  select 'state', (select count(*) from universal.state) 
