<script>
export default {};
</script>

<template>
  <b-card no-body class="reference-container">
    <b-tabs card pills vertical>
      <b-tab title="Dummy" active>
        <b-card-text class="reference-contents">
          <p class="dummy">Foo!</p>
        </b-card-text>
      </b-tab>
      <b-tab title="Dummier" active>
        <b-card-text class="reference-contents">
          <p class="dummy">…bar?</p>
          <p class="dummy">Bazz.</p>
        </b-card-text>
      </b-tab>
    </b-tabs>
  </b-card>
</template>

<style>
.reference-contents {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.reference-contents .dummy {
  margin: var(--spacer);
}

@media screen {
  .reference-container {
    height: var(--main-height);
    overflow-y: hidden;
  }

  .reference-container ul[role=tablist] {
    height: var(--main-height) !important;
  }

  .reference-contents {
    height: var(--main-height);
    overflow-y: auto;
  }
}

@media print {
  .reference-container ul[role=tablist] {
    display: none;
  }
}
</style>
