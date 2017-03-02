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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        // null as boolean_value,
        // null as numeric_value,
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
        // null as boolean_value,
        // null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        // null as boolean_value,
        // null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        // null as boolean_value,
        // null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
    sourceTable: 'measurements',
    query: `
      select
        id as emr_entry_id,
        null as code_system,
        null as code_value,
        measuringInstruction as text_value,
        null as date_value,
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
        null as boolean_value,
        null as numeric_value,
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
  // --------------------------------------------------------------- MEDICATION ADMINISTRATION (011)
  {
    target: 'Entry',
    entryId: '011',
    entryName: 'Medication Administration',
    sourceTable: 'preventions',
    query: `
      select
        id as emr_id,
        demographic_no as emr_patient_id
      from preventions
      order by id
      limit {offset}, {limit}`,
  },
  {
    target: 'EntryState',
    entryId: '011',
    entryName: 'Medication Administration',
    sourceTable: 'preventions',
    query: `
      select
        id as emr_id,
        null as state,
        creation_date as effective_date,
        null as emr_reference
      from preventions
      order by id
      limit {offset}, {limit}`,
  },
  {
    /*  Only have an optional user filled text field for medication name  */
    target: 'EntryAttribute',
    attributeId: '011.001',
    attributeName: 'Medication Administration - Medication',
    sourceTable: 'preventions',
    query: `
      SELECT
        p.id AS emr_entry_id,
        'OSCAR' AS code_system,
        pe.val AS code_value,
        pe.val AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        p.id AS emr_id,
        p.creation_date AS emr_effective_date,
        NULL AS emr_reference
      FROM preventions AS p
      LEFT OUTER JOIN preventionsExt AS pe
        ON p.id = pe.prevention_id
        AND pe.keyval = 'name'
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '011.002',
  //   attributeName: 'Medication Administration - Classification',
  //   sourceTable: 'preventions',
  //   query: null,
  // },
  {
    target: 'EntryAttribute',
    attributeId: '011.003',
    attributeName: 'Medication Administration - Administration Date',
    sourceTable: 'preventions',
    query: `
      SELECT
        p.id AS emr_entry_id,
        NULL AS code_system,
        NULL AS code_value,
        NULL AS text_value,
        p.prevention_date AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        p.id AS emr_id,
        p.creation_date AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.preventions AS p
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '011.004',
  //   attributeName: 'Medication Administration - Expiry Date',
  //   sourceTable: 'preventions',
  //   query: null,
  // },
  {
    target: 'EntryAttribute',
    attributeId: '011.005',
    attributeName: 'Medication Administration - Dose',
    sourceTable: 'preventions',
    query: `
      SELECT
        p.id AS emr_entry_id,
        'OSCAR' AS code_system,
        NULL AS code_value,
        NULL AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        pe.val AS number_value,
        p.id AS emr_id,
        p.creation_date AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.preventions AS p
      LEFT OUTER JOIN oscar_15.preventionsExt AS pe
        ON p.id = pe.prevention_id
        AND pe.keyval = 'dose'
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '011.006',
  //   attributeName: 'Medication Administration - Unit of Measure',
  //   sourceTable: 'preventions',
  //   query: null,
  // },
  {
    target: 'EntryAttribute',
    attributeId: '011.007',
    attributeName: 'Medication Administration - Not Given',
    sourceTable: 'drugs',
    query: `
      SELECT
        p.id AS emr_entry_id,
        'OSCAR' AS code_system,
        NULL AS code_value,
        NULL AS text_value,
        NULL AS date_value,
        CASE WHEN p.refused > 0 THEN TRUE ELSE FALSE END AS boolean_value,
        NULL as numeric_value,
        p.id AS emr_id,
        p.creation_date AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.preventions AS p
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '011.008',
    attributeName: 'Medication Administration - Not Given Reason',
    sourceTable: 'drugs',
    query: `
      SELECT
        p.id AS emr_entry_id,
        'OSCAR' AS code_system,
        pe.val AS code_value,
        pe.val AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        p.id AS emr_id,
        p.creation_date AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.preventions AS p
      LEFT OUTER JOIN oscar_15.preventionsExt AS pe
        ON p.id = pe.prevention_id
        AND pe.keyval = 'neverReason'
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '011.009',
  //   attributeName: 'Medication Administration - Reaction',
  //   sourceTable: 'preventions',
  //   query: null,
  // },
  {
    target: 'EntryAttribute',
    attributeId: '011.010',
    attributeName: 'Medication Administration - Admin Site',
    sourceTable: 'preventions',
    query: `
      SELECT
        p.id AS emr_entry_id,
        'OSCAR' AS code_system,
        pe.val AS code_value,
        pe.val AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        p.id AS emr_id,
        p.creation_date AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.preventions AS p
      LEFT OUTER JOIN oscar_15.preventionsExt AS pe
        ON p.id = pe.prevention_id
        AND pe.keyval = 'location'
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '011.012',
    attributeName: 'Medication Administration - Route',
    sourceTable: 'preventions',
    query: `
      SELECT
        p.id AS emr_entry_id,
        'OSCAR' AS code_system,
        pe.val AS code_value,
        pe.val AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        p.id AS emr_id,
        p.creation_date AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.preventions AS p
      LEFT OUTER JOIN oscar_15.preventionsExt AS pe
        ON p.id = pe.prevention_id
        AND pe.keyval = 'route'
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '011.013',
    attributeName: 'Medication Administration - Lot',
    sourceTable: 'preventions',
    query: `
      SELECT
        p.id AS emr_entry_id,
        'OSCAR' AS code_system,
        pe.val AS code_value,
        pe.val AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        p.id AS emr_id,
        p.creation_date AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.preventions AS p
      LEFT OUTER JOIN oscar_15.preventionsExt AS pe
        ON p.id = pe.prevention_id
        AND pe.keyval = 'lot'
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  // ---------------------------------------------------------------------------- Prescription (012)
 {
    target: 'Entry',
    entryId: '012',
    entryName: 'Prescription',
    sourceTable: 'drugs',
    query: `
      SELECT
        drugid as emr_id,
        demographic_no as emr_patient_id
      FROM drugs
      ORDER BY drugid
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryState',
    entryId: '012',
    entryName: 'Prescription',
    sourceTable: 'drugs',
    query: `
      select
        drugid as emr_id,
        null as state,
        written_date as effective_date,
        null as emr_reference
      from drugs
      order by emr_id
      limit {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '012.001',
    attributeName: 'Prescription - Medication',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        'DIN' AS code_system,
        d.regional_identifier AS code_value,
        d.BN AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '012.002',
    attributeName: 'Prescription - Classification',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        'ATC' AS code_system,
        d.ATC AS code_value,
        t.tc_atc AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      JOIN drugref.cd_drug_product AS p
        ON d.regional_identifier = p.drug_identification_number
      JOIN drugref.cd_therapeutic_class AS t
        ON p.drug_code = t.drug_code
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '012.003',
    attributeName: 'Prescription - Prescribing Provider',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        'OSCAR' AS code_system,
        d.provider_no AS code_value,
        CONCAT_WS(', ', p.last_name, p.first_name) AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      JOIN oscar_15.provider AS p
        ON d.provider_no = p.provider_no
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '012.004',
    attributeName: 'Prescription - Dose Instructions',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        NULL AS code_system,
        NULL AS code_value,
        d.special AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '012.005',
    attributeName: 'Prescription - PRN Flag',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        NULL AS code_system,
        NULL AS code_value,
        NULL AS text_value,
        NULL AS date_value,
        CASE WHEN d.prn = 0 THEN false ELSE true END as boolean_value,
        NULL as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '012.006',
  //   attributeName: 'Prescription - Dose',
  //   sourceTable: 'drugs',
  //   query: null,
  // },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '012.007',
  //   attributeName: 'Prescription - Dose Unit of Measure',
  //   sourceTable: 'drugs',
  //   query: null,
  // },
  {
    target: 'EntryAttribute',
    attributeId: '012.008',
    attributeName: 'Prescription - Start Date',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        NULL AS code_system,
        NULL AS code_value,
        NULL AS text_value,
        rx_date AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '012.009',
    attributeName: 'Prescription - Stop Date',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        NULL AS code_system,
        NULL AS code_value,
        NULL AS text_value,
        end_date AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '012.010',
  //   attributeName: 'Prescription - Indication',
  //   sourceTable: 'prescription',
  //   query: null, /* Bugged and not saving in the EMR */
  // },
  {
    target: 'EntryAttribute',
    attributeId: '012.011',
    attributeName: 'Prescription - Stop Reason',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        'OSCAR' AS code_system,
        archived_reason AS code_value,
        archived_reason AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '012.012',
    attributeName: 'Prescription - Status',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        'OSCAR' AS code_system,
        CASE
          WHEN d.archived = 0 THEN 'Active'
          ELSE 'Stopped'
          /* Might be more complicated logic to flesh out here */
        END AS code_value,
        d.archived_reason AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '012.013',
    attributeName: 'Prescription - Drug Form',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        'OSCAR' AS code_system,
        d.drug_form AS code_value,
        d.drug_form AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  // {
  //   target: 'EntryAttribute',
  //   attributeId: '012.014',
  //   attributeName: 'Prescription - Strength',
  //   sourceTable: 'drugs',
  //   query: null /* not easily parsable */,
  // },
  {
    target: 'EntryAttribute',
    attributeId: '012.015',
    attributeName: 'Prescription - Strength Unit',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        'OSCAR' AS code_system,
        d.unit AS code_value,
        d.unit AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '012.016',
    attributeName: 'Prescription - Frequency',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        'OSCAR' AS code_system,
        d.freqcode AS code_value,
        CASE LOWER(d.freqcode)
          WHEN 'bid' THEN 'Twice Daily'
          WHEN 'tid' THEN 'Three Times a Day'
          WHEN 'qid' THEN 'Four Times a Day'
          WHEN 'q1h' THEN 'Every Hour'
          WHEN 'q2h' THEN 'Every Two Hours'
          WHEN 'q1-2h' THEN 'Every One to Two Hours'
          WHEN 'q3-4h' THEN 'Every Three to Four Hours'
          WHEN 'q4h' THEN 'Every Four Hours'
          WHEN 'q4-6h' THEN 'Every Four to Six Hours'
          WHEN 'q6h' THEN 'Every Six Hours'
          WHEN 'q8h' THEN 'Every Eight Hours'
          WHEN 'q12h' THEN 'Every Twelve Hours'
          WHEN 'qam' THEN 'Every Day Before Noon'
          WHEN 'qpm' THEN 'Every Day After Noon'
          WHEN 'qhs' THEN 'Every Night at Bedtime'
          WHEN 'q1week' THEN 'Every Week'
          WHEN 'q2week' THEN 'Every Two Weeks'
          WHEN 'q1month' THEN 'Every Month'
          WHEN 'q3month' THEN 'Every Three Months'
          ELSE d.freqcode
        END AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '012.017',
    attributeName: 'Prescription - Administration Route',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        'OSCAR' AS code_system,
        d.route AS code_value,
        CASE LOWER(d.route)
          WHEN 'po' THEN 'By Mouth or Orally'
          WHEN 'sl' THEN 'Sublingually'
          WHEN 'im' THEN 'Intramuscular'
          WHEN 'subcut' THEN 'Subcutaneous'
          WHEN 'patch' THEN 'Patch'
          WHEN 'top' THEN 'Topical'
          WHEN 'inh' THEN 'Inhalation'
          WHEN 'supp' THEN 'Supplement'
          ELSE d.route
        END AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '012.018',
    attributeName: 'Prescription - Duration Count',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        NULL AS code_system,
        NULL AS code_value,
        NULL AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        duration as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '012.019',
    attributeName: 'Prescription - Duration Unit',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        'OSCAR' AS code_system,
        d.durunit AS code_value,
        CASE LOWER(d.durunit)
          WHEN 'd' THEN 'day'
          WHEN 'w' THEN 'week'
          WHEN 'm' THEN 'month'
          WHEN 'mo' THEN 'month'
          ELSE d.durunit
        END AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        NULL as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '012.020',
    attributeName: 'Prescription - Dispense Quantity',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        NULL AS code_system,
        NULL AS code_value,
        NULL AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        d.quantity as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },
  {
    target: 'EntryAttribute',
    attributeId: '012.021',
    attributeName: 'Prescription - Refill Count',
    sourceTable: 'drugs',
    query: `
      SELECT
        d.drugid AS emr_entry_id,
        NULL AS code_system,
        NULL AS code_value,
        NULL AS text_value,
        NULL AS date_value,
        NULL as boolean_value,
        d.repeat as numeric_value,
        d.drugid AS emr_id,
        d.lastUpdateDate AS emr_effective_date,
        NULL AS emr_reference
      FROM oscar_15.drugs AS d
      ORDER BY emr_entry_id
      LIMIT {offset}, {limit}`,
  },


];


// -Medications
