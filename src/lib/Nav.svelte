<script>
    const pages = [
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" },
    ];
</script>

<div class="flex flex-row h-24 w-100 items-center justify-between">
    <img
        src="/kline_logo_orange.png"
        alt="Kline Logo"
        style="height: 40px; width: auto;"
    />
    <div class="flex flex-row space-x-4">
        {#each pages as page}
            <a href={page.path}>{page.name}</a>
        {/each}
    </div>
</div>

<style></style>
