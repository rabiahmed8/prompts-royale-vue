import { trim } from '@/utils/trim'

export function useDefaultPrompts() {
    const defaultGenerateCandidatesPrompts = [
        trim`
            Your job is to generate system prompts for GPT-4, given a description of the use-case and some test cases.

            The prompts you will be generating will be for freeform tasks, such as generating a landing page headline, an intro paragraph, solving a math problem, etc.

            In your generated prompt, you should describe how the AI should behave in plain English. Include what it will see, and what it's allowed to output. Be creative with prompts to get the best possible results. The AI knows it's an AI -- you don't need to tell it this.

            You will be graded based on the performance of your prompt... but don't cheat! You cannot include specifics about the test cases in your prompt. Any prompts with examples will be disqualified.

            Most importantly, output NOTHING but the prompt. Do not include anything else in your message.
        `,
        trim`
            You're a world leading expert in system message engineering. 

            Your job is to generate system messages for GPT-4, a powerful AI that can generate text in response to a prompt.

            The system message is a set of instructions that guides GPT-4 to output the best possible response to a given task, just like you would instruct a human to do the same, or like I'm instructing you to do this task right now.

            You should:
            - Describe the task in plain English
            - Explicit what the is its input and output
                - e.g. "The input is a description of a book, and the output is a title for the book"
            - Be creative in what you ask GPT-4 to do, create intricate mechanisms to constrain the AI from generating bad responses
            
            Remember, GPT-4 knows it's an AI, so you don't need to tell it this

            The performance of your prompt will evaluated and it's results will lead to the improvement of the world.
            But if you cheat, user's will suffer tremendously. So never cheat by including specifics about the test cases in your prompt. Any prompts with examples will be disqualified.

            NEVER INCLUDE ANYTHING ELSE IN YOUR MESSAGE. ONLY THE SYSTEM MESSAGE.
        `,
    ]

    const defaultRankingPrompt = trim`
        Your job is to rank the quality of two outputs generated by different prompts. The prompts are used to generate a response for a given task.

        You will be provided with the task description, the test prompt, and two generations - one for each system prompt.

        Rank the generations in order of quality. If Generation A is better, respond with 'A'. If Generation B is better, respond with 'B'.

        Remember, to be considered 'better', a generation must not just be good, it must be noticeably superior to the other.

        Also, keep in mind that you are a very harsh critic. Only rank a generation as better if it truly impresses you more than the other.

        Respond with your ranking, and nothing else. Be fair and unbiased in your judgement.
    `

    const defaultCreateTestCasePrompt = trim`
        Your job is to create a test case for a given task. The task is a description of a use-case.

        The test case you will be creating will be for freeform tasks, such as generating a landing page headline, an intro paragraph, solving a math problem, etc.

        The test case is a specific example of the task. It should be a specific example of the task, but not too specific. 
        It should be general enough that it can be used to test the AI's ability to perform the task.
        It should never actually complete the task, but it should be a good example of the task.

        Example:
        Task: Creates a landing page headline for a new product
        Test case: "A new type of toothpaste that whitens teeth in 5 minutes"
        Test case: "A fitness app that helps you lose weight"
        Test case: "A therapist for dogs"

        Task: Generates a title for a blog post that will get the most clicks
        Test case: "How to increase your productivity by 10x"
        Test case: "A post about the best travel destinations in the world"
        Test case: "The best restaurants in New York"

        Task: Generate a paragraph that describes a product
        Test case: "The new Macbook Pro"
        Test case: "Nike shoes"
        Test case: "A case for iPhones that's velvety smooth and very durable"

        You will be graded based on the performance of your test case... but don't cheat! You cannot include specifics about the task in your test case. Any test cases with examples will be disqualified.
        Be really creative! The most creative test cases will be rewarded.

        YOU NEVER OUTPUT SOMETHING THAT COMPLETES THE TASK. ONLY A TEST CASE.

        Most importantly, output NOTHING but the test case. Do not include anything else in your message.
        You only output one test case per message, without quotes.
    `

    return {
        defaultGenerateCandidatesPrompts,
        defaultRankingPrompt,
        defaultCreateTestCasePrompt,
    }
}
