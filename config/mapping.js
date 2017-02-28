module.exports = [
  {
    target: 'Clinic',
    query: `
      select
        clinic_name as name,
        'HRM??' as hdc_reference,
        clinic_no as emr_clinic_id,
        null as emr_reference
      from clinic
      order by clinic_no
      limit {offset}, {limit}`,
  },
  {
    target: 'Practitioner',
    query: `
      select
        (select clinic_no from clinic) as emr_clinic_id,
        CONCAT(first_name, ' ', last_name) as name,
        COALESCE(billing_no, 'NA') as identifier,
        'MSP', provider_no as emr_practitioner_id,
        null as emr_reference
      from provider
      order by provider_no
      limit {offset}, {limit}`,
  },
  {
    target: 'Patient',
    query: `
      select
        (select clinic_no from clinic) as emr_clinic_id,
        demographic_no as emr_patient_id,
        null as emr_reference
      from demographic
      order by demographic_no
      limit {offset}, {limit}`,
  },
  {
    target: 'PatientPractitioner',
    query: `
      select
        demographic_no as emr_patient_id,
        provider_no as emr_practitioner_id,
        demographic_no as emr_practitioner_provider_id,
        null as emr_reference
      from demographic
      order by demographic_no
      limit {offset}, {limit}`,
  },
  // --------------------------------------------------------------------------------- ADDRESS (001)
  {
    target: 'Entry',
    entryId: '001',
    entryName: 'Address',
    sourceTable: 'demographic',
    query: `
      select
        demographic_no as emr_id,
        demographic_no as emr_patient_id
      from demographic
      union
      select
        demographic_no as emr_id,
        demographic_no as emr_patient_id
      from
        demographicArchive
      order by emr_id, emr_patient_id
      limit {offset}, {limit}`,
  },
  {
    target: 'EntryState',
    entryId: '001',
    entryName: 'Address',
    sourceTable: 'demographic',
    query: `
      select
        demographic_no as emr_id,
        patient_status as state,
        effective_date,
        archive_id as emr_reference
      from (
        select
          demographic_no,
          patient_status,
          DATE_FORMAT(TIMESTAMPADD(MICROSECOND, -1, TIMESTAMPADD(DAY, 1, patient_status_date)), '%Y-%m-%dT%T.%fZ') as effective_date,
          null as archive_id
        from demographic
        union all
        select
          demographic_no,
          patient_status,
          DATE_FORMAT(TIMESTAMPADD(MICROSECOND, id, patient_status_date), '%Y-%m-%dT%T.%fZ') as effective_date,
          id as archive_id
        from demographicArchive
      ) as t
      where effective_date is not null
      order by emr_id, emr_reference
      limit {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '001.001',
  //   attributeName: 'Address - Type',
  //   query: ``,
  // },
  {
    target: 'EntryAttribute',
    attributeId: '001.002',
    attributeName: 'Address - Street Line 1',
    sourceTable: 'demographic',
    query: `
      select
        demographic_no as emr_entry_id,
        null as code_system,
        null as code_value,
        address as text_value,
        null as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        null as emr_reference
      from demographic
      union all
      select
        demographic_no as emr_entry_id,
        null as code_system,
        null as code_value,
        address as text_value,
        null as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        id as emr_reference from demographicArchive
      order by emr_entry_id, emr_reference
      limit {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '001.003',
  //   attributeName: 'Address - Street Line 2',
  //   query: ``,
  // },
  {
    target: 'EntryAttribute',
    attributeId: '001.004',
    attributeName: 'Address - City',
    sourceTable: 'demographic',
    query: `
      select
        demographic_no as emr_entry_id,
        null as code_system,
        null as code_value,
        city as text_value,
        null as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        null as emr_reference
      from demographic
      union all
      select
        demographic_no as emr_entry_id,
        null as code_system,
        null as code_value,
        city as text_value,
        null as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        id as emr_reference from demographicArchive
      order by emr_entry_id, emr_reference
      limit {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '001.005',
    attributeName: 'Address - Province',
    sourceTable: 'demographic',
    query: `
      select
        demographic_no as emr_entry_id,
        null as code_system,
        null as code_value,
        province as text_value,
        null as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        null as emr_reference
      from demographic
      union all
      select
        demographic_no as emr_entry_id,
        null as code_system,
        null as code_value,
        province as text_value,
        null as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        id as emr_reference from demographicArchive
      order by emr_entry_id, emr_reference
      limit {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '001.006',
    attributeName: 'Address - Postal Code',
    sourceTable: 'demographic',
    query: `
      select
        demographic_no as emr_entry_id,
        null as code_system,
        null as code_value,
        postal as text_value,
        null as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        null as emr_reference
      from demographic
      union all
      select
        demographic_no as emr_entry_id,
        null as code_system,
        null as code_value,
        postal as text_value,
        null as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        id as emr_reference from demographicArchive
      order by emr_entry_id, emr_reference
      limit {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '001.007',
  //   attributeName: 'Address - Country',
  //   query: ``,
  // },
  // --------------------------------------------------------------------ADVERSE REACTION RISK (002)
  // ----------------------------------------------------------------------------------BILLING (003)
  // ----------------------------------------------------------------------------------CONTACT (006)
  // {
  //   target: 'Entry',
  //   entryId: '006',
  //   entryName: 'Contact',
  //   sourceTable: 'demographic',
  //   query: `
  //     select
  //       demographic_no as emr_id,
  //       demographic_no as emr_patient_id
  //     from demographic
  //     union
  //     select
  //       demographic_no as emr_id,
  //       demographic_no as emr_patient_id
  //     from
  //       demographicArchive
  //     order by emr_id, emr_patient_id
  //     limit {offset}, {limit}`,
  // },
  // {
  //   target: 'EntryState',
  //   entryId: '006',
  //   entryName: 'Contact',
  //   sourceTable: 'demographic',
  //   query: `
  //     select
  //       demographic_no as emr_id,
  //       patient_status as state,
  //       effective_date,
  //       archive_id as emr_reference
  //     from (
  //       select
  //         demographic_no,
  //         patient_status,
  //         DATE_FORMAT(TIMESTAMPADD(MICROSECOND, -1, TIMESTAMPADD(DAY, 1, patient_status_date)), '%Y-%m-%dT%T.%fZ') as effective_date,
  //         null as archive_id
  //       from demographic
  //       union all
  //       select
  //         demographic_no,
  //         patient_status,
  //         DATE_FORMAT(TIMESTAMPADD(MICROSECOND, id, patient_status_date), '%Y-%m-%dT%T.%fZ') as effective_date,
  //         id as archive_id
  //       from demographicArchive
  //     ) as t
  //     where effective_date is not null
  //     order by emr_id, emr_reference
  //     limit {offset}, {limit}`,
  // },
  // // {
  // //   target: 'EntryAttribute',
  // //   attributeId: '006.001',
  // //   attributeName: 'Contact - Record Type',
  // //   query: ``,
  // // },
  // // {
  // //   target: 'EntryAttribute',
  // //   attributeId: '006.002',
  // //   attributeName: 'Contact - Location',
  // //   query: ``,
  // // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '006.003',
  //   attributeName: 'Contact - Value',
  //   sourceTable: 'demographic',
  //   query: `
  //     select
  //       demographic_no as emr_entry_id,
  //       null as code_system,
  //       null as code_value,
  //       address as text_value,
  //       null as date_value,
  //       demographic_no as emr_id,
  //       lastUpdateDate as effective_date,
  //       null as emr_reference
  //     from demographic
  //     union all
  //     select
  //       demographic_no as emr_entry_id,
  //       null as code_system,
  //       null as code_value,
  //       address as text_value,
  //       null as date_value,
  //       demographic_no as emr_id,
  //       lastUpdateDate as effective_date,
  //       id as emr_reference from demographicArchive
  //     order by emr_entry_id, emr_reference
  //     limit {offset}, {limit}`,
  // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '006.004',
  //   attributeName: 'Contact - Start Date',
  //   query: ``,
  // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '006.005',
  //   attributeName: 'Contact - End Date',
  //   query: ``,
  // },
  // ----------------------------------------------------------------------------------BARRIER (019)
  // ----------------------------------------------------------------------------- OBSERVATION (009)
  {
    target: 'Entry',
    entryId: '009',
    entryName: 'Observation',
    sourceTable: 'measurements',
    query: `
      select
        id as emr_id,
        demographicNo as emr_patient_id
        from measurements
        order by id
        limit {offset}, {limit}`,
  },
  {
    target: 'EntryState',
    entryId: '009',
    entryName: 'Observation',
    sourceTable: 'measurements',
    query: `
      select
        id as emr_id,
        null as state,
        dateEntered as effective_date,
        null as emr_reference
      from measurements
      order by id
      limit {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '009.001',
    attributeName: 'Observation - Observation',
    sourceTable: 'measurements',
    query: `
      select
        m.id as emr_entry_id,
        'OSCAR' as code_system,
        m.type as code_value,
        mt.typeDescription as text_value,
        null as date_value,
        m.id as emr_id,
        m.dateEntered as effective_date,
        null as emr_reference
      from measurements as m
      left join measurementType as mt
      on mt.type = m.type
      order by emr_entry_id
      limit {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '009.001',
  //   attributeName: 'Observation - Observation',
  //   sourceTable: 'measurementsDeleted',
  //   query: `
  //     select
  //       originalId as emr_entry_id,
  //       'OSCAR' as code_system,
  //       type as code_value,
  //       null as text_value,
  //       null as date_value,
  //       id as emr_id,
  //       dateEntered as effective_date,
  //       id as emr_reference
  //     from measurementsDeleted
  //     order by emr_entry_id, emr_reference
  //     limit {offset}, {limit}`,
  // },
  {
    target: 'EntryAttribute',
    attributeId: '009.002',
    attributeName: 'Observation - Observation Date',
    sourceTable: 'measurements',
    query: `
      select
        id as emr_entry_id,
        null as code_system,
        null as code_value,
        null as text_value,
        dateObserved as date_value,
        id as emr_id,
        dateEntered as effective_date,
        null as emr_reference
      from measurements
      order by emr_entry_id
      limit {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '009.002',
  //   attributeName: 'Observation - Observation Date',
  //   sourceTable: 'measurementsDeleted',
  //   query: `
  //     select
  //       originalId as emr_entry_id,
  //       null as code_system,
  //       null as code_value,
  //       null as text_value,
  //       dateObserved as date_value,
  //       id as emr_id,
  //       dateEntered as effective_date,
  //       id as emr_reference
  //     from measurementsDeleted
  //     order by emr_entry_id, emr_reference
  //     limit {offset}, {limit}`,
  // },
  {
    target: 'EntryAttribute',
    attributeId: '009.003',
    attributeName: 'Observation - Value',
    sourceTable: 'measurements',
    query: `
      select
        id as emr_entry_id,
        null as code_system,
        null as code_value,
        dataField as text_value,
        null as date_value,
        id as emr_id,
        dateEntered as effective_date,
        null as emr_reference
      from measurements
      order by emr_entry_id
      limit {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '009.004',
  //   attributeName: 'Observation - Normal Range',
  //   query: ``,
  // },
  {
    target: 'EntryAttribute',
    attributeId: '009.005',
    attributeName: 'Observation - Unit of Measure',
    query: `
      select
        id as emr_entry_id,
        null as code_system,
        null as code_value,
        measuringInstruction as text_value,
        null as date_value,
        id as emr_id,
        dateEntered as effective_date,
        null as emr_reference
      from measurements
      order by emr_entry_id
      limit {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '009.006',
  //   attributeName: 'Observation - Status',
  //   query: ``,
  // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '009.007',
  //   attributeName: 'Observation - Performed By',
  //   query: ``,
  // },
  // ------------------------------------------------------------------------- DEMOGRAPHIC
  {
    target: 'Entry',
    entryId: '005',
    entryName: 'Demographic',
    sourceTable: 'demographic',
    query: `
      select
        demographic_no as emr_id,
        demographic_no as emr_patient_id
      from demographic
      order by demographic_no
      limit {offset}, {limit}`,
  },
  {
    target: 'EntryState',
    entryId: '005',
    entryName: 'Demographic',
    sourceTable: 'demographic',
    query: `
      select
        demographic_no as emr_id,
        patient_status as state,
        effective_date,
        archive_id as emr_reference
      from (
        select
          demographic_no,
          patient_status,
          DATE_FORMAT(TIMESTAMPADD(MICROSECOND, -1, TIMESTAMPADD(DAY, 1, patient_status_date)), '%Y-%m-%dT%T.%fZ') as effective_date,
          null as archive_id
        from demographic
        union all
        select
          demographic_no,
          patient_status,
          DATE_FORMAT(TIMESTAMPADD(MICROSECOND, id, patient_status_date), '%Y-%m-%dT%T.%fZ') as effective_date,
          id as archive_id
        from demographicArchive
      ) as t
      where effective_date is not null
      order by demographic_no, archive_id
      limit {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '005.001',
    attributeName: 'Demographic - Birth Date',
    sourceTable: 'demographic',
    query: `
      select
        demographic_no as emr_entry_id,
        null as code_system,
        null as code_value,
        null as text_value,
        CAST(CONCAT(year_of_birth, '-', month_of_birth, '-', date_of_birth) as Date) as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        null as emr_reference
      from demographic
      union all
      select
        demographic_no as emr_entry_id,
        null as code_system,
        null as code_value,
        null as text_value,
        CAST(CONCAT(year_of_birth, '-', month_of_birth, '-', date_of_birth) as Date) as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        id as emr_reference from demographicArchive
      order by emr_entry_id, emr_reference
      limit {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '005.002',
    attributeName: 'Demographic - Administrative Gender',
    sourceTable: 'demographic',
    query: `
      select
        demographic_no as emr_entry_id,
        'OSCAR' as code_system,
        sex as code_value,
        null as text_value,
        null as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        null as emr_reference
      from demographic
      union all
      select
        demographic_no as emr_entry_id,
        'OSCAR' as code_system,
        sex as code_value,
        null as text_value,
        null as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        id as emr_reference
      from demographicArchive
      order by emr_entry_id, emr_reference
      limit {offset}, {limit}; `,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '005.003',
  //   attributeName: 'Biological Gender',
  //   query: ``,
  // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '005.004',
  //   attributeName: 'Preferred Gender',
  //   query: ``,
  // },
  {
    target: 'EntryAttribute',
    attributeId: '005.005',
    attributeName: 'Demographic - Given Name',
    sourceTable: 'demographic',
    query: `
      select
        demographic_no as emr_entry_id,
        null as code_system,
        null as code_value,
        first_name as text_value,
        null as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        null as emr_reference
      from demographic
      union all
      select
        demographic_no as emr_entry_id,
        null as code_system,
        null as code_value,
        first_name as text_value,
        null as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        id as emr_reference
      from demographicArchive
      order by emr_entry_id, emr_reference
      limit {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '005.006',
    attributeName: 'Demographic - Family Name',
    sourceTable: 'demographic',
    query: `
      select
        demographic_no as emr_entry_id,
        null as code_system,
        null as code_value,
        last_name as text_value,
        null as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        null as emr_reference
      from demographic
      union all
      select
        demographic_no as emr_entry_id,
        null as code_system,
        null as code_value,
        last_name as text_value,
        null as date_value,
        demographic_no as emr_id,
        lastUpdateDate as effective_date,
        id as emr_reference
      from demographicArchive
      order by emr_entry_id, emr_reference
      limit {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '005.009',
  //   attributeName: 'Demographic - Marital Status',
  //   query: ``,
  // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '005.010',
  //   attributeName: 'Demographic - Race',
  //   query: ``,
  // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '005.011',
  //   attributeName: 'Demographic - Ethnicity',
  //   query: ``,
  // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '005.012',
  //   attributeName: 'Demographic - Living Arrangement',
  //   query: ``,
  // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '005.013',
  //   attributeName: 'Demographic - Education Level',
  //   query: ``,
  // },
  // ------------------------------------------------------------------------- PROBLEM
  {
    target: 'Entry',
    entryId: '014',
    entryName: 'Problem',
    sourceTable: 'dxresearch',
    query: `
      select
        dxresearch_no as emr_id,
        demographic_no as emr_patient_id
      from dxresearch
      order by dxresearch_no
      limit {offset}, {limit}`,
  },
  {
    target: 'EntryState',
    entryId: '014',
    entryName: 'Problem',
    sourceTable: 'dxresearch',
    query: `
      select
        dxresearch_no as emr_id,
        'A' as state,
        start_date as effective_date,
        null as emr_reference
      from dxresearch
      where
        status <> 'A'
        and start_date <> cast(update_date as date)
      union all
      select
        dxresearch_no as emr_id,
        status as state,
        update_date as effective_date,
        null as emr_reference
      from dxresearch
      order by emr_id
      limit {offset}, {limit};`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '014.001',
    attributeName: 'Problem - Problem',
    sourceTable: 'dxresearch',
    query: `
      select
        dxresearch_no as emr_entry_id,
        coding_system as code_system,
        dxresearch_code as code_value,
        null as text_value,
        null as date_value,
        dxresearch_no as emr_id,
        update_date as effective_date,
        null as emr_reference
      from dxresearch
      order by dxresearch_no
      limit {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '014.002',
    attributeName: 'Problem - Onset Date',
    sourceTable: 'dxresearch',
    query: `
      select
        dxresearch_no as emr_entry_id,
        null as code_system,
        null as code_value,
        null as text_value,
        start_date as date_value,
        dxresearch_no as emr_id,
        update_date as effective_date,
        null as emr_reference
      from dxresearch
      order by dxresearch_no
      limit {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '014.003',
    attributeName: 'Problem - Resolution Date',
    sourceTable: 'dxresearch',
    query: `
      select
        dxresearch_no as emr_entry_id,
        null as code_system,
        null as code_value,
        null as text_value,
        update_date as date_value,
        dxresearch_no as emr_id,
        update_date as effective_date,
        null as emr_reference
      from dxresearch
      where status <> 'A'
      order by dxresearch_no
      limit {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '014.004',
  //   attributeName: 'Problem - Diagnostic Stage',
  //   query: ``,
  // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '014.005',
  //   attributeName: 'Problem - Severity',
  //   query: ``,
  // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '014.006',
  //   attributeName: 'Problem - Negative Flag',
  //   query: ``,
  // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '014.007',
  //   attributeName: 'Problem - Laterality',
  //   query: ``,
  // },
  // ------------------------------------------------------------------------- ENCOUNTER
  {
    target: 'Entry',
    entryId: '007',
    entryName: 'Encounter',
    sourceTable: 'casemgmt_note',
    query: `
      select
        note_id as emr_id,
        demographic_no as emr_patient_id
      from casemgmt_note
      order by note_id
      limit {offset}, {limit}`,
  },
  {
    target: 'EntryState',
    entryId: '007',
    entryName: 'Encounter',
    sourceTable: 'casemgmt_note',
    query: `
      select
        note_id as emr_id,
        null as state,
        update_date as effective_date,
        null as emr_reference
      from casemgmt_note
      limit {offset}, {limit}`,
  },

  {
    target: 'EntryAttribute',
    attributeId: '007.001',
    attributeName: 'Encounter - Encounter Date',
    sourceTable: 'casemgmt_note',
    query: `
      select
        note_id as emr_entry_id,
        null as code_system,
        null as code_value,
        null as text_value,
        observation_date as date_value,
        note_id as emr_id,
        update_date as effective_date,
        null as emr_reference
      from casemgmt_note
      order by note_id
      limit {offset}, {limit}`,
  },
  // {
  //   attributeId: '007.002',
  //   name: 'Reason',
  //   query: ``,
  // },
  {
    target: 'EntryAttribute',
    attributeId: '007.003',
    attributeName: 'Encounter - Encounter Type',
    sourceTable: 'casemgmt_note',
    query: `
      select
        note_id as emr_entry_id,
        'OSCAR' as code_system,
        encounter_type as code_value,
        null as text_value,
        null as date_value,
        note_id as emr_id,
        update_date as effective_date,
        null as emr_reference
      from casemgmt_note
      order by note_id
      limit {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '007.004',
  //   attributeName: 'Encounter - Encounter Mode',
  //   query: ``,
  // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '007.005',
  //   attributeName: 'Encounter - Encounter Class',
  //   query: ``,
  // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '007.006',
  //   attributeName: 'Encounter - Primary Diagnosis',
  //   query: ``,
  // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '007.007',
  //   attributeName: 'Encounter - Additional Diagnosis',
  //   query: ``,
  // },
];

// -Immunization
// -Medications
