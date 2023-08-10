export interface KitData {
  id: string
  label_id: string
  shipping_tracking_code: string
}

export interface SearchData {
  query: string,
  data: KitData[]
}