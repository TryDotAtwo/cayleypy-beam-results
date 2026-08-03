# Отправка решений CayleyPy

Здесь лежат два равноправных способа отправить проверяемые решения через Cloudflare в этот GitHub-репозиторий:

1. Codex-плагин `cayleypy-results-publisher` — агент сам проводит preflight, отправку, resume и проверку публикации.
2. Автономный Python CLI `cli/cayleypy_submit.py` — работает на Kaggle, SLURM-кластере, Linux, Windows и локальной машине; внешние Python-пакеты не нужны.

Пользователь не вводит endpoint и не создаёт GitHub/Cloudflare token. Публичный Worker уже закреплён внутри CLI.

## Получить ветку через GitHub CLI

```bash
gh repo clone TryDotAtwo/cayleypy-beam-results -- --branch codex/cayleypy-results-publisher
cd cayleypy-beam-results
```

Или обычным Git:

```bash
git clone --branch codex/cayleypy-results-publisher https://github.com/TryDotAtwo/cayleypy-beam-results.git
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

## Безопасность и лимиты

- никаких пользовательских токенов;
- фиксированный HTTPS origin и запрет redirect/cross-origin status URL;
- stable User-Agent для Kaggle/Cloudflare;
- replay ходов и proof hashes перед сетью для простого CSV/moves режима;
- максимум 32 MiB compressed, 64 MiB raw и 100 000 envelopes на вход;
- receipt-manifest не содержит решения или состояния;
- unknown/private/token/password fields отклоняются до отправки.