# language: es
Característica: Ingesta de material
  Como estudiante
  Quiero cargar un PDF o un Markdown en una materia y una unidad
  Para tener ese material disponible para estudiar sin duplicarlo

  # AC-001-01
  Escenario: No reindexa un documento ya cargado para el mismo usuario y materia
    Dado que cargué un documento en una materia
    Cuando vuelvo a cargar el mismo contenido en esa materia
    Entonces el sistema me devuelve el mismo documento
    Y no vuelve a parsearlo ni a pedir embeddings
    Y no guarda otro lote de chunks

  # AC-001-01
  Escenario: No reindexa si solo cambia el nombre del archivo
    Dado que cargué un documento en una materia
    Cuando vuelvo a cargar el mismo contenido con otro nombre de archivo
    Entonces el sistema me devuelve el mismo documento
    Y no vuelve a parsearlo ni a pedir embeddings

  # AC-001-02
  Escenario: Cada chunk guarda materia, unidad, documento y página
    Dado un documento con texto en una página
    Cuando lo cargo en una materia y una unidad
    Entonces cada chunk guardado lleva esa materia, esa unidad, ese documento y esa página

  # AC-001-03
  Escenario: Los mismos bytes de otro usuario se indexan
    Dado que un usuario ya cargó un documento en una materia
    Cuando otro usuario carga el mismo contenido en esa materia
    Entonces el sistema lo indexa como un documento nuevo

  # AC-001-03
  Escenario: Los mismos bytes en otra materia se indexan
    Dado que cargué un documento en una materia
    Cuando cargo el mismo contenido en otra materia
    Entonces el sistema lo indexa como un documento nuevo

  # AC-001-04
  Escenario: Un documento sin texto no pide embeddings y no se reindexa
    Dado un documento cuyas páginas no tienen texto
    Cuando lo cargo
    Entonces no se piden embeddings
    Y no se guarda ningún chunk
    Y el hash queda registrado
    Cuando vuelvo a cargar el mismo contenido
    Entonces el sistema no lo vuelve a parsear

  # AC-001-05
  Escenario: Si el parser falla no queda nada persistido
    Dado un documento que el parser no puede leer
    Cuando intento cargarlo
    Entonces la carga falla
    Y no se piden embeddings
    Y no queda documento ni chunk persistido

  # AC-001-05
  Escenario: Si los embeddings fallan se puede reintentar
    Dado un documento con texto
    Y un proveedor de embeddings que falla
    Cuando intento cargarlo
    Entonces la carga falla
    Y no queda documento ni chunk persistido
    Cuando el proveedor de embeddings vuelve a funcionar y lo cargo de nuevo
    Entonces el sistema lo indexa
