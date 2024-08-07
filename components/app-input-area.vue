<!-- eslint-disable no-console -->
<script lang="ts" setup>
import type { TestCase } from 'utils/types'
import { randomId } from '@/utils/random-id'

const {
    description,
    // testCases,
    candidates,
    runNumberOfBattles,
    battlesToRun,
    stopRunningBattles,
    isGeneratingTestCases,
    generateTestCases,
} = useAutoPrompter()
const toast = useNotification()
const testCases = ref<TestCase[]>([])

// eslint-disable-next-line @typescript-eslint/space-before-function-paren
function deleteTestCase (testCaseId: any) {
    testCases.value = testCases.value.filter(testCase => testCase.id !== testCaseId)
}

const numberOfBattles = ref(60)
async function runOrStopBattles() {
    if (battlesToRun.value > 0) {
        stopRunningBattles()
        return
    }

    if (numberOfBattles.value < 1) {
        toast.error('You need to run at least 1 battle.')
        return
    }

    if (candidates.value.length === 0) {
        toast.error('You need a list of prompt candidates first.')
        return
    }

    runNumberOfBattles(numberOfBattles.value)
}

const runBattlesText = computed(() => {
    if (battlesToRun.value <= 0)
        return `Run +${numberOfBattles.value || 0} battles`

    return `Stop battles (${battlesToRun.value} left)`
})

const isGenerateTestCasesModalOpen = ref(false)
const testCaseAmount = ref(5)
const fileInputRef: Ref<HTMLInputElement | null> = ref(null)

function onClickGenerateTestCases() {
    if (!description.value) {
        toast.error('You need to add a description first.')
        return
    }
    isGenerateTestCasesModalOpen.value = true
}
function onGenerateTestCases() {
    generateTestCases(testCaseAmount.value)
    isGenerateTestCasesModalOpen.value = false
}
function onClickAddTestCase() {
    testCases.value.push({
        prompt: '',
        expectedOutput: '',
        id: randomId(),
    })
}
function onUploadCSV() {
    if (fileInputRef.value)
        fileInputRef.value.click()
}

function parseCSV(csvData: string) {
    let currentIndex = 0
    const rows: string[] = ['']
    let insideQuotes = false

    while (currentIndex < csvData.length) {
        const char = csvData[currentIndex++]

        if (char === '"') {
            insideQuotes = !insideQuotes
            rows[rows.length - 1] += char
        }
        else if (char === '\n' && !insideQuotes) {
            rows.push('')
        }
        else {
            rows[rows.length - 1] += char
        }
    }

    const parsedData = rows.map((row) => {
        const columns = []
        let currentColumn = ''
        insideQuotes = false

        for (let i = 0; i < row.length; i++) {
            const char = row[i]

            if (char === '"') {
                // insideQuotes = !insideQuotes
                // currentColumn += char
                if (insideQuotes) {
                    if (i < row.length - 1 && row[i + 1] === '"') {
                        currentColumn += char
                        i++
                    }
                    else {
                        insideQuotes = false
                    }
                }
                else {
                    insideQuotes = true
                }
            }
            else if (char === ',' && !insideQuotes) {
                columns.push(currentColumn.trim())
                currentColumn = ''
            }
            else {
                currentColumn += char
            }
        }

        columns.push(currentColumn.trim())
        const sanitizedColumns = columns.map(col => col.replace(/\n/g, ' '))
        return sanitizedColumns
    })

    return parsedData
}

function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files)
        return
    const uploadedFile = input.files[0]
    console.error(uploadedFile)

    if (uploadedFile.type !== 'text/csv') {
        console.error('Please select a CSV file.')
        return
    }
    console.time('myTimer')
    const reader = new FileReader()
    reader.onload = () => {
        const csvData = reader.result as string
        console.log(csvData)
        const rows = csvData.split('\r\n')
        const column = rows[0].split(',')
        // const { rows, columns } = parseCSV(csvData)
        const inputIndex = column.findIndex(e => (e.toLowerCase() === 'input'))
        const outputIndex = column.findIndex(e => (e.toLowerCase() === 'output'))
        const parsedData = parseCSV(csvData)
        console.log(parsedData)
        const data = parsedData.slice(1)

        // const dataArray = data.map(row => row.split(','))
        // console.log(dataArray)

        // const mappedData = data.map((row: any) => ({
        //     prompt: row[inputIndex],
        //     expectedOutput: row[outputIndex],
        //     id: row[0],
        //     // id: randomId(),
        // }))

        const mappedData = data.map((row: any) => {
            let idValue: string
            const idColumnIndex = column.findIndex((e: string) => e.toLowerCase() === 'id')

            if (idColumnIndex !== -1 && row[idColumnIndex])
                idValue = row[idColumnIndex]

            else
                idValue = randomId()

            return {
                prompt: row[inputIndex],
                expectedOutput: row[outputIndex],
                id: idValue,
            }
        })
        // console.log([...testCases.value, ...mappedData])
        testCases.value = [...testCases.value, ...mappedData]
    }
    console.timeEnd('myTimer')

    reader.readAsText(uploadedFile)
    // console.log('uploadedFile:', uploadedFile)
    if (fileInputRef.value)
        fileInputRef.value.value = ''
}

function deleteTestCases() {
    testCases.value = []
}
// testCases.value=[...testCases.value,...csvData]
</script>

<template>
    <UCard
        h-full
        :ui="{
            footer: {
                base: 'sticky bottom-0 bg-white z-555',
            },
            body: {
                base: 'overflow-y-auto',
            },
        }"
    >
        <template #header>
            <div font-bold text-5 sticky top-0>
                Options
            </div>
        </template>
        <UFormGroup
            mt--2
            label="Description"
            description="This is where you state the objective of the final prompt. Your objective is to..."
            text-4.5
        >
            <ClientOnly>
                <UTextarea
                    v-model="description"
                    variant="outline"
                    placeholder="e.g. Create headlines from the user prompt" autoresize size="xl" mb-4
                />
                <template #placeholder>
                    <USkeleton w-full h-18 my-2 />
                </template>
            </ClientOnly>
        </UFormGroup>

        <!-- Add test cases -->
        <div>
            <div text-4.5>
                Test cases
            </div>
            <div text-sm op-50>
                Add test cases to test the generated prompts. The prompts will be rated based on how well it performs on these test cases.
            </div>

            <UButton icon="i-tabler-plus text-4.5 text-emerald" color="white" mt-2 @click="onClickAddTestCase">
                Add test case
            </UButton>
            <UButton ml-2 icon="i-tabler-plus text-4.5 text-emerald" color="white" mt-2 @click="onUploadCSV">
                Upload CSV
            </UButton>
            <input ref="fileInputRef" accept=".csv" hidden type="file" @change="onFileChange">
            <UTooltip
                text="Creates generated test cases and adds to the currents one."
                :ui="{
                    width: 'max-w-xl',
                }"
                ml-2
            >
                <UButton
                    icon="i-tabler-sparkles text-4.5 text-indigo" color="white" mt-2
                    :loading="isGeneratingTestCases"
                    @click="onClickGenerateTestCases"
                >
                    Generate additional test cases
                </UButton>
            </UTooltip>
            <UButton icon="i-tabler-trash text-5" color="gray" square mt-2 p-2 @click="deleteTestCases">
                Delete All
            </UButton>

            <ClientOnly>
                <div v-if="testCases.length" flex="~ col" gap-3 mt-2>
                    <TestCaseInput
                        v-for="testCase in testCases"
                        :key="testCase.id"
                        :test-case-id="testCase.id"
                        :test-case="testCase"
                        @delete="deleteTestCase"
                    />
                </div>
                <template #placeholder>
                    <div flex="~ col" gap-2 mt-2>
                        <USkeleton v-for="i in 4" :key="i" w-full h-8 />
                    </div>
                </template>
            </ClientOnly>
        </div>

        <UModal v-model="isGenerateTestCasesModalOpen">
            <div p-4>
                <div text-2xl font-bold>
                    Generating test cases
                </div>
                <div text-lg op-70 mt-2>
                    How many test cases do you want to generate? A minimum of 5 is recommended.
                </div>
                <UInput
                    v-model="testCaseAmount"
                    variant="outline"
                    type="number"
                    placeholder="5"
                    size="xl"
                    my-4
                    @keyup.enter="onGenerateTestCases"
                />
                <div flex justify-end gap-2 mt-6>
                    <UButton color="white" size="lg" @click="isGenerateTestCasesModalOpen = false">
                        Cancel
                    </UButton>
                    <UButton color="indigo" size="lg" @click="onGenerateTestCases">
                        Generate
                    </UButton>
                </div>
            </div>
        </UModal>
        <template #footer>
            <div flex="~ col" gap-2>
                <ClientOnly>
                    <template #placeholder>
                        <USkeleton w-full h-10 my-2 />
                    </template>
                    <div flex items-center gap-2>
                        <UButton
                            :icon="battlesToRun > 0 ? 'i-tabler-player-stop-filled' : 'i-tabler-sword' + ' text-4.5'"
                            size="lg"
                            grow
                            :color="
                                battlesToRun > 0 ? 'red' : 'indigo'
                            "
                            @click="runOrStopBattles"
                        >
                            {{ runBattlesText }}
                        </UButton>
                        <div w-27>
                            <UInput v-if="battlesToRun <= 0" v-model="numberOfBattles" placeholder="# of Battles" size="lg" type="number" min="1" />
                        </div>
                    </div>
                </ClientOnly>
            </div>
        </template>
    </UCard>
</template>
