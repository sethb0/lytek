<script>
import MfFramework from '@/toplevel/framework.vue';

export default {
  components: { MfFramework },
};
</script>

<template>
  <mf-framework variant="info" legal-notice>
    Another joyful frobnitz from Metal&nbsp;Fatigue&nbsp;LLC!
    <template #additional>
      <p>
        <em class="brand-font">Lytek</em> provides dice-rolling and character sheet tracking
        for chronicles of <em>Exalted</em>&reg;&nbsp;2.5<sup>th</sup>&nbsp;Edition,
        published by White Wolf Entertainment.
      </p>
    </template>
  </mf-framework>
</template>
