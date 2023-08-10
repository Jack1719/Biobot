import data from '../../../assets/data.json'
export async function GET(request: Request) {
  // return filterd data based on query params
  const params = new URL(request.url).searchParams
  const query = params.get('query')
  
  // if no query param return nothing
  if (!query) {
    return new Response(JSON.stringify([]), {
      headers: { 'content-type': 'application/json' },
    })
  }

  // searchparam can be label_id or shipping_tracking_code so we need to find both
  const filteredData = data.filter((kitData) => kitData.label_id.search(query) !== -1 || kitData.shipping_tracking_code.search(query) !== -1)

  return new Response(JSON.stringify(filteredData), {
    headers: { 'content-type': 'application/json' },
  })
}