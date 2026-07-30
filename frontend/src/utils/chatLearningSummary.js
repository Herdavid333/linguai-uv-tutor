const normalizeText = (
  value = ""
) => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(
      /[.,!?;:'"`´]/g,
      ""
    )
    .replace(/\s+/g, " ");
};

const normalizeCorrectionType = (
  type = ""
) => {
  const normalizedType =
    normalizeText(type);

  const supportedTypes = [
    "grammar",
    "vocabulary",
    "spelling",
    "capitalization",
    "coherence",
    "word_order",
    "other",
  ];

  return supportedTypes.includes(
    normalizedType
  )
    ? normalizedType
    : "grammar";
};

const buildCorrectionKey = (
  correction
) => {
  const wrong = normalizeText(
    correction?.wrong
  );

  const correct = normalizeText(
    correction?.correct
  );

  const type =
    normalizeCorrectionType(
      correction?.type
    );

  return `${type}|${wrong}|${correct}`;
};

export const mergeCorrections = (
  currentCorrections = [],
  incomingCorrections = []
) => {
  const correctionsMap =
    new Map();

  currentCorrections.forEach(
    (correction) => {
      if (
        !correction?.wrong ||
        !correction?.correct
      ) {
        return;
      }

      const key =
        buildCorrectionKey(
          correction
        );

      correctionsMap.set(key, {
        wrong:
          correction.wrong.trim(),

        correct:
          correction.correct.trim(),

        explanation:
          correction.explanation ||
          "",

        type:
          normalizeCorrectionType(
            correction.type
          ),

        occurrences:
          typeof correction
            .occurrences ===
          "number"
            ? correction.occurrences
            : 1,
      });
    }
  );

  incomingCorrections.forEach(
    (correction) => {
      if (
        !correction?.wrong ||
        !correction?.correct
      ) {
        return;
      }

      const key =
        buildCorrectionKey(
          correction
        );

      const existingCorrection =
        correctionsMap.get(key);

      if (existingCorrection) {
        correctionsMap.set(key, {
          ...existingCorrection,

          explanation:
            (
              correction.explanation ||
              ""
            ).length >
            (
              existingCorrection
                .explanation ||
              ""
            ).length
              ? correction.explanation
              : existingCorrection
                  .explanation,

          occurrences:
            existingCorrection
              .occurrences + 1,
        });

        return;
      }

      correctionsMap.set(key, {
        wrong:
          correction.wrong.trim(),

        correct:
          correction.correct.trim(),

        explanation:
          correction.explanation ||
          "",

        type:
          normalizeCorrectionType(
            correction.type
          ),

        occurrences: 1,
      });
    }
  );

  return Array.from(
    correctionsMap.values()
  );
};

export const mergeNewWords = (
  currentWords = [],
  incomingWords = []
) => {
  const wordsMap = new Map();

  currentWords.forEach(
    (item) => {
      if (!item?.word) {
        return;
      }

      const key = normalizeText(
        item.word
      );

      wordsMap.set(key, {
        word: item.word.trim(),

        meaning:
          item.meaning ||
          item.definition ||
          "",

        example:
          item.example || "",

        occurrences:
          typeof item.occurrences ===
          "number"
            ? item.occurrences
            : 1,
      });
    }
  );

  incomingWords.forEach(
    (item) => {
      if (!item?.word) {
        return;
      }

      const key = normalizeText(
        item.word
      );

      const existingWord =
        wordsMap.get(key);

      if (existingWord) {
        wordsMap.set(key, {
          ...existingWord,

          meaning:
            existingWord.meaning ||
            item.meaning ||
            item.definition ||
            "",

          example:
            existingWord.example ||
            item.example ||
            "",

          occurrences:
            existingWord
              .occurrences + 1,
        });

        return;
      }

      wordsMap.set(key, {
        word: item.word.trim(),

        meaning:
          item.meaning ||
          item.definition ||
          "",

        example:
          item.example || "",

        occurrences: 1,
      });
    }
  );

  return Array.from(
    wordsMap.values()
  );
};

export const mergeGrammarStructures =
  (
    currentStructures = [],
    incomingStructures = []
  ) => {
    const structuresMap =
      new Map();

    [
      ...currentStructures,
      ...incomingStructures,
    ].forEach((item) => {
      let normalizedItem;

      if (
        typeof item ===
        "string"
      ) {
        normalizedItem = {
          structure:
            item.trim(),

          explanation: "",
          example: "",
        };
      } else if (
        item &&
        typeof item ===
          "object"
      ) {
        normalizedItem = {
          structure:
            item.structure
              ?.trim() ||
            item.name?.trim() ||
            item.title?.trim() ||
            "",

          explanation:
            item.explanation
              ?.trim() ||
            "",

          example:
            item.example
              ?.trim() ||
            "",
        };
      } else {
        return;
      }

      if (
        !normalizedItem.structure
      ) {
        return;
      }

      const key = normalizeText(
        normalizedItem.structure
      );

      const existingStructure =
        structuresMap.get(key);

      if (existingStructure) {
        structuresMap.set(key, {
          structure:
            existingStructure
              .structure,

          explanation:
            existingStructure
              .explanation ||
            normalizedItem
              .explanation,

          example:
            existingStructure
              .example ||
            normalizedItem.example,
        });

        return;
      }

      structuresMap.set(
        key,
        normalizedItem
      );
    });

    return Array.from(
      structuresMap.values()
    );
  };