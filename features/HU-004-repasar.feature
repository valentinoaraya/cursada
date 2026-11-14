# language: es
Característica: Repasar las preguntas falladas
  Como estudiante
  Quiero volver a las preguntas que fallé
  Para repasar lo que no supe

  # AC-004-01
  Escenario: La pregunta fallada aparece en el repaso de esa materia
    Dado que cargué material en la unidad uno
    Cuando fallo una pregunta de esa unidad
    Y pido repasar esa materia
    Entonces veo esa pregunta en el repaso

  # AC-004-02
  Escenario: Una respuesta correcta no entra al repaso
    Dado que cargué material en la unidad uno
    Cuando acierto una pregunta de esa unidad
    Y pido repasar esa materia
    Entonces esa pregunta no aparece en el repaso

  # AC-004-03
  Escenario: No veo la fallada de otra persona
    Dado que otra persona falló una pregunta de la materia
    Cuando pido repasar esa materia
    Entonces no veo la pregunta de esa persona
