# Отправка решений CayleyPy

Выберите способ по происхождению решения:

| Что отправляете | Как отправить | Где появится |
|---|---|---|
| Результаты ML beam search с данными запуска | [CLI или Codex-плагин](#ml-beam-search) | Таблицы и страницы GitHub после проверки и публикации в `main` |
| Точное перечисление, алгебра, BFS, решения из командных сабмитов или другие готовые пути | [API внешних решений](#external-solutions) | Cloudflare принимает и проверяет; [опубликованный набор Cube555](external-solutions/cayley-py-555-cube/cube555-kaggle-v1/) хранится файлами в GitHub отдельно от ML-каталога |

<a id="ml-beam-search"></a>
## ML beam search

Здесь лежат два равноправных способа отправить проверяемые решения через Cloudflare в этот GitHub-репозиторий:

1. Codex-плагин `cayleypy-results-publisher` — агент сам проводит preflight, отправку, resume и проверку публикации.
2. Автономный Python CLI `cli/cayleypy_submit.py` — работает на Kaggle, SLURM-кластере, Linux, Windows и локальной машине; внешние Python-пакеты не нужны.

Пользователь не вводит endpoint и не создаёт GitHub/Cloudflare token. Публичный Worker уже закреплён внутри CLI.

## Получить репозиторий через GitHub CLI

```bash
gh repo clone TryDotAtwo/cayleypy-beam-results 
cd cayleypy-beam-results
```

Или обычным Git:

```bash
git clone https://github.com/TryDotAtwo/cayleypy-beam-results.git
cd cayleypy-beam-results
```

## Самый быстрый вариант: готовый JSON

Если solver/notebook уже создал envelope v1 для Kaggle либо v2 для native/SLURM:

```bash
python cli/cayleypy_submit.py preflight results.json
python cli/cayleypy_submit.py submit results.json --wait
```

Итоговый успех выглядит так:

```json
{"accepted":1,"duplicate":0,"published":1,"rejected":0,"unresolved":0}
```

HTTP 202 означает только приём Worker. Считать публикацию завершённой можно при `rejected=0` и `unresolved=0` после `--wait` или `poll`.

## Строка ходов или CSV/TSV

Один раз создайте заполненный конфиг запуска:

```bash
python cli/cayleypy_submit.py init --source kaggle --output publisher-config.json
# Для SLURM/кластера/local:
python cli/cayleypy_submit.py init --source native --output publisher-config.json
```

Отредактируйте автора, соревнование, модель, hardware, beam/profile, runtime, `run_id`, commit solver и `puzzle_contexts`. Нельзя выдумывать неизвестные поля.

Одна строка ходов, когда в конфиге один puzzle id:

```bash
python cli/cayleypy_submit.py submit solution.moves --config publisher-config.json --wait
```

Много решений:

```bash
copy cli\templates\solutions.csv solutions.csv  # Windows
cp cli/templates/solutions.csv solutions.csv     # Linux/Kaggle
python cli/cayleypy_submit.py submit solutions.csv --config publisher-config.json --wait
```

Режим `first`: одна строка, `collection_status=first_solution`. Режим сбора: все найденные решения отдельными строками, последовательный `collection_index`. CLI сохраняет полный metadata каждого решения и автоматически делит набор на последовательные gzip-архивы не более 32 MiB.

## Kaggle

Положите папку `cli` в Kaggle Dataset/Input или скопируйте её в notebook. После solve:

```python
import subprocess, sys
subprocess.run([
    sys.executable,
    "/kaggle/input/cayleypy-results-publisher/cli/cayleypy_submit.py",
    "submit",
    "/kaggle/working/results.json",
    "--wait",
], check=True)
```

Для CSV добавьте `--config /kaggle/working/publisher-config.json`.

## Resume и отдельная проверка

CLI атомарно пишет `cayleypy-receipts.json`. После обрыва сети повторите идентичный `submit`: уже принятые части не отправятся повторно.

```bash
python cli/cayleypy_submit.py poll --manifest cayleypy-receipts.json --timeout 300
```

## Установка Codex-плагина

Marketplace находится в `.agents/plugins/marketplace.json`.

```bash
codex plugin marketplace add .
codex plugin add cayleypy-results-publisher@multigpu-beam-search
```

В Codex попросите: «Опубликуй мои CayleyPy solutions из `results.json` и проверь GitHub». Агент обязан использовать pinned endpoint, не спрашивать токен, не печатать payload и не заявлять успех до терминального receipt/GitHub-проверки.

Подробности:

- [инструкция человеку](plugins/cayleypy-results-publisher/references/HUMAN_GUIDE_RU.md);
- [контракт агенту](plugins/cayleypy-results-publisher/references/AGENT_PROTOCOL.md);
- [готовые v1/v2 и CSV-шаблоны](cli/templates);
- [README плагина](plugins/cayleypy-results-publisher/README.md).

## Безопасность и лимиты ML-публикации

- никаких пользовательских токенов;
- фиксированный HTTPS origin и запрет redirect/cross-origin status URL;
- stable User-Agent для Kaggle/Cloudflare;
- replay ходов и proof hashes перед сетью для простого CSV/moves режима;
- максимум 32 MiB compressed, 64 MiB raw и 100 000 envelopes на вход;
- receipt-manifest не содержит решения или состояния;
- unknown/private/token/password fields отклоняются до отправки.

<a id="external-solutions"></a>
## Внешние решения: точное перечисление, алгебра, BFS и другие методы

1. Откройте [список зарегистрированных контекстов](https://cayleypy-results-ingest-staging.tupa-expert.workers.dev/v1/contexts) и возьмите точные `competition` и `context_version`. Если нужной головоломки или версии нет, попросите администратора зарегистрировать начальные состояния, точные цели и перестановки ходов. Загрузкой решений создать или поменять контекст нельзя.
2. Подготовьте `external-solutions.json`. Для каждого решения нужны `puzzle_id`, массив ходов `path` и `source` с полями `method`, `url`, `version`, `credit`, `license`. Поле `label` необязательно. `url` должен вести на публичный HTTPS-источник без параметров запроса, фрагмента и учётных данных. Не добавляйте модель, GPU, время или score; эти поля API не принимает.
3. Получите у владельца отдельный токен загрузки и установите его локально в `EXTERNAL_SOLUTIONS_UPLOAD_TOKEN`. Это не GitHub-токен и не Cloudflare API-токен для управления Worker. Не помещайте токен в JSON, Git, чат или журналы.

Ниже шаблон: замените ходы, ссылку и остальные сведения о фактическом источнике. Пример не является готовым решением.

```json
{
  "competition": "cayley-py-555-cube",
  "context_version": "cube555-kaggle-v1",
  "solutions": [
    {
      "puzzle_id": 35,
      "path": ["r0", "-d1"],
      "source": {
        "method": "exact_enumeration",
        "url": "https://example.org/public-result",
        "version": "1",
        "credit": "Name or team",
        "license": "CC0-1.0"
      }
    }
  ]
}
```

Методы: `exact_enumeration`, `team_submission`, `algebraic`, `search`, `bfs`, `beam_search`, `human`, `other`. Публикуйте только то, что имеете право распространять; не копируйте лицензию примера, если она не относится к вашему источнику.

**Отправка (Bash):**

```bash
curl --fail-with-body -sS \
  -H "Authorization: Bearer ${EXTERNAL_SOLUTIONS_UPLOAD_TOKEN:?set the upload token}" \
  -H "Content-Type: application/json" \
  --data-binary @external-solutions.json \
  https://cayleypy-results-ingest-staging.tupa-expert.workers.dev/v1/solutions
```

На запрос: до 24 решений, 3 000 ходов суммарно и 256 КиБ JSON; на решение до 1 024 ходов. Загружайте крупный набор отдельными пачками и сохраняйте ответы. Сервер воспроизводит каждый путь по зарегистрированным правилам; если путь не достигает цели, вся пачка отклоняется до записи. Успех: HTTP `201` при новой записи или новом источнике, `200` при повторе. Для каждого элемента ответ содержит `id` и статус `created`, `source_added` или `existing`. После обрыва можно повторить идентичную пачку без дублей.

**Проверка приёма:** откройте `https://cayleypy-results-ingest-staging.tupa-expert.workers.dev/v1/solutions/<id>` и проверьте `verification: replay_passed` и `sources`. Токен для чтения не нужен. [Пример: решения Cube555 для задачи 35](https://cayleypy-results-ingest-staging.tupa-expert.workers.dev/v1/solutions?competition=cayley-py-555-cube&context_version=cube555-kaggle-v1&puzzle_id=35). Для списка по задаче добавьте `limit` (до 50), а для следующей страницы передайте `next_cursor` из ответа в параметре `after`. Проверка доказывает достижение цели, а не кратчайший путь или полноту перечисления.

Приём API не означает, что новый результат уже появился в GitHub. Проверяйте опубликованный коммит или каталог внешних решений отдельно от ответа Cloudflare.

[Регистрация контекста и воспроизводимый импорт Cube555](https://github.com/TryDotAtwo/cayleypy-beam-results/tree/a2cad545a910aaff1ed8ecb157a30f999ceb28ee/services/external-solutions-api).
