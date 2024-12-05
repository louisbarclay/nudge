<script lang="ts">
	export let onNext: () => void;
</script>

<div class="max-w-xl p-6 mx-auto space-y-6">
	<h1 class="text-3xl font-bold">Welcome to the new Nudge!</h1>

	<p>
		A while ago, you installed <a
			href="https://chromewebstore.google.com/detail/nudge/dmhgdnbkjkejeddddlklojinngaideac"
			class="text-blue-600 hover:underline"
			target="_blank">Nudge</a
		>, an extension to help you save time online. Now, Nudge is back with a new
		version and a new focus:
	</p>

	<p class="text-lg font-bold text-gray-900">
		Hide everything that gets in the way of your online life.
	</p>

	<p class="">
		Think of Nudge as an ad blocker, except for distractions like news feeds,
		recommended content and comments.
	</p>

	<p class="">
		Imagine a world where all these things are hidden by default, but a click
		away whenever you need them. A radically different status quo.
	</p>
	<p>I hope Nudge will change the way you see — or don't see — the internet.</p>

	<div class="p-6 space-y-4 bg-white border rounded-lg">
		<button
			on:click={onNext}
			class="w-full px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
		>
			Try the new Nudge
		</button>

		<p class="text-sm text-center text-gray-600">
			Completely free and <a
				href="https://github.com/louisbarclay/nudge"
				class="underline"
				target="_blank">open source on GitHub</a
			>
		</p>
		<p class="text-sm text-center text-gray-600">
			2,000 users, 4.6 stars from 83 reviews
		</p>
	</div>

	<div class="flex items-center pt-6 space-x-4">
		<img
			src="/louis-profile-pic.jpeg"
			alt="Louis Barclay"
			class="w-24 h-24 rounded-full"
		/>
		<div>
			<p class="font-medium">Thanks,<br />Louis Barclay</p>
			<p class="mt-2 text-sm text-gray-600">
				Founder of Nudge<br />
				Fellow at the Applied Social Media Lab, Harvard University
			</p>
		</div>
	</div>

	<p class="text-sm text-gray-600">
		P.S. Upset about a feature that no longer exists? I get it. Email me at
		hi@nudgeware.io and I'll suggest an alternative.
	</p>
</div>
