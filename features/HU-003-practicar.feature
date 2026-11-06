# language: es
Característica: Practicar con preguntas de una unidad
  Como estudiante
  Quiero que me genere preguntas de una unidad y corrija lo que respondo citando la fuente
  Para practicar con mi material

  # AC-003-01
  Escenario: La pregunta sale solo del material de esa unidad
    Dado que cargué material en la unidad uno
    Cuando pido practicar la unidad uno
    Entonces recibo una pregunta hecha solo con ese material

  # AC-003-02
  Escenario: La corrección muestra si está bien o fallé y cita la fuente
    Dado que cargué material en la unidad uno
    Cuando pido practicar la unidad uno
    Y pido practicar la unidad uno de nuevo
    Entonces veo si está bien o si fallé, con el archivo y la página de donde sale la corrección

  # AC-003-03
  Escenario: No usa material de otro usuario, otra materia u otra unidad
    Dado pasajes de otra persona o de otra materia o de otra unidad
    Cuando pido practicar la unidad uno
    Entonces no recibo una pregunta armada con material ajeno
    Cuando pido corregir sobre la unidad uno
    Entonces la corrección tampoco usa material ajeno

  # AC-003-04
  Escenario: Unidad sin material avisa sin inventar
    Dado que esa unidad no tiene material indexado
    Cuando pido practicar una unidad sin material
    Entonces me avisa "No está en tu material" y no recibo una pregunta
