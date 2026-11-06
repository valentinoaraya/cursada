# language: es
Característica: Preguntar al material
  Como estudiante
  Quiero preguntar con mis palabras y ver la respuesta mientras se escribe, con el archivo y la página
  Para no estudiar algo inventado

  # AC-002-01
  Escenario: La respuesta cita el archivo y la página del material
    Dado que mi material de la materia contiene la respuesta
    Cuando pregunto con mis palabras sobre esa materia
    Entonces veo la respuesta mientras se escribe
    Y la respuesta cita el archivo y la página de donde sale

  # AC-002-02
  Escenario: Sin evidencia avisa que no está en el material
    Dado que mi material de la materia no contiene la respuesta
    Cuando pregunto sobre esa materia
    Entonces me avisa "No está en tu material"
    Y no me da una respuesta generada

  # AC-002-03
  Escenario: No usa material de otro usuario ni de otra materia
    Dado un pasaje de otra persona o mío de otra materia
    Cuando pregunto sobre esta materia
    Entonces la respuesta no lo cita ni lo usa
