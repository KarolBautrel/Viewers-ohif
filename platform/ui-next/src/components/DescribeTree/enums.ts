export enum Step {
  SelectMode = 'selectMode',
  Locations = 'locations',
  Form = 'form',
  Features = 'features',
  VirtualLocation = 'virtualLocation',
}

export enum NodeType {
  SYMPTOM = 'objaw_radiologiczny',
  CHARACTERISTIC = 'cecha',
  SUMMARIES = 'wnioski',
  SUMMARY= 'wniosek',
  RECOGNITIONS = 'rozpoznanie_roznicowe',
  MEASUREMENTS_DATA = 'dane_z_pomiaru',
  LOCALIZATION = 'lokalizacja',
  REFERRAL_DATA = 'dane_ze_skierowania',
  METADATA = 'dane_ze_skierowania',
}
