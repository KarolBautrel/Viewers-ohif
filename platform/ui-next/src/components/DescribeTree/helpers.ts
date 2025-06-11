export function cleanChoice (path:Record<string,string>[]):Record<string,string|number>[]{
    let step = 1;
    const cleanedSelectedPath = path.map(p => ({
      step: step++,
      type: p.type,
      name: p.name,
      uuid: p.uuid ? p.uuid : p.element_id_property
    }));
  
    return cleanedSelectedPath
}   